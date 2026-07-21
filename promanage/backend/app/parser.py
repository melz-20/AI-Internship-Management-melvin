"""
Parsing and segregation logic for uploaded datasets.

Supports:
  - Excel (.xlsx, .xls) via pandas + openpyxl / xlrd
  - CSV (.csv) via pandas
  - Word (.docx) via python-docx, reading any tables in the document
  - PDF (.pdf) via pdfplumber, extracting any tables found on each page

Expected (flexible) column names in the source file - matching is
case-insensitive and tolerant of common synonyms:
    employee_name / name
    email
    role
    project_name / project
    start_date
    deadline
    actual_completion_date / completion_date
    status
    progress_percent / progress
    assigned_date
    role_on_project

Segregation rule: if a row has a project_name but no employee_name (or vice
versa), it is still captured -  an employee with no project becomes
"unassigned" naturally because no Assignment row is created for them.
"""
import io
from datetime import datetime
from typing import List, Dict, Any

import pandas as pd
import pdfplumber
from docx import Document

# Exact-match aliases for column headers that don't need keyword sniffing.
COLUMN_ALIASES = {
    "employee_name": "employee_name", "name": "employee_name", "employee": "employee_name",
    "employees": "employee_name", "people": "employee_name", "person": "employee_name",
    "team_members": "employee_name", "team_member": "employee_name", "team": "employee_name",
    "staff": "employee_name", "assigned_to": "employee_name", "assignee": "employee_name",
    "resource": "employee_name", "resources": "employee_name", "member": "employee_name",
    "email": "email",
    "role": "role", "employee_role": "role",
    "project_name": "project_name", "project": "project_name",
    "start_date": "start_date",
    "deadline": "deadline", "due_date": "deadline", "end_date": "deadline",
    "actual_completion_date": "actual_completion_date", "completion_date": "actual_completion_date",
    "status": "status",
    "progress_percent": "progress_percent", "progress": "progress_percent",
    "phase": "phase", "project_phase": "phase", "stage": "phase",
    "project_manager": "project_manager", "manager": "project_manager", "pm": "project_manager",
    "assigned_date": "assigned_date",
    "role_on_project": "role_on_project", "project_role": "role_on_project",
}

SUPPORTED_EXTENSIONS = (".xlsx", ".xls", ".csv", ".tsv", ".txt", ".json", ".rtf", ".docx", ".pdf")


def _canonical_field(raw_col: Any) -> "str | None":
    """
    Maps a source column header to one of our canonical field names.
    Tries an exact alias match first, then falls back to keyword-based
    rules so real-world header variations still work without needing a
    hand-maintained alias for every possible spelling - e.g. a column
    literally named "%", "Progress%", "Completion %", or "Completion
    Percentage" should all be recognized as progress, and "End Date" or
    "Target End Date" should all be recognized as the deadline.
    """
    key = str(raw_col).strip().lower().replace(" ", "_")
    if key in COLUMN_ALIASES:
        return COLUMN_ALIASES[key]

    # Strip a bare "%" sign so "progress%" behaves the same as "progress_%"
    key_no_pct = key.replace("%", "").strip("_")
    if key_no_pct in COLUMN_ALIASES:
        return COLUMN_ALIASES[key_no_pct]

    # Keyword fallbacks, most-specific checks first.
    if key in ("%", "pct", "percent", "percentage"):
        return "progress_percent"
    if "progress" in key or "completion" in key or "percent" in key or key.endswith("pct"):
        return "progress_percent"
    if "phase" in key or "stage" in key:
        return "phase"
    if "manager" in key or "mgr" in key or key == "pm" or ("project" in key and "lead" in key) or "managed_by" in key or "owner" in key:
        return "project_manager"
    if "deadline" in key or "due" in key or ("end" in key and "date" in key):
        return "deadline"
    if "start" in key and "date" in key:
        return "start_date"
    if key == "status" or "status" in key:
        return "status"
    if "drop_reason" in key or "cancellation_reason" in key or "reason" in key:
        return "drop_reason"
    if "project" in key and ("name" in key or "title" in key):
        return "project_name"
    if (
        "employee" in key or "people" in key or "staff" in key or "resource" in key
        or "assignee" in key or "assigned_to" in key
        or ("team" in key and ("member" in key or key in ("team", "teams")))
        or key in ("name", "person", "member", "members")
    ):
        return "employee_name"
    if "assigned" in key and "date" in key:
        return "assigned_date"

    return None


# Maps many possible raw status values (any casing/spacing) to our four
# canonical statuses. Exact matches are checked first for speed/precision;
# _canonical_status then falls back to substring matching so real-world
# variations that aren't in this exact list - "On Hold - Client", "Blocked
# (waiting on vendor)", "Delayed", extra punctuation, etc. - still get
# classified correctly instead of silently defaulting to "active".
STATUS_VALUE_MAP = {
    "active": "active", "in_progress": "active", "in-progress": "active", "inprogress": "active",
    "ongoing": "active", "started": "active", "open": "active",
    "completed": "completed", "complete": "completed", "done": "completed", "finished": "completed",
    "closed": "completed",
    "dropped": "dropped", "cancelled": "dropped", "canceled": "dropped", "abandoned": "dropped",
    "terminated": "dropped", "scrapped": "dropped", "rejected": "dropped",
    "on_hold": "on_hold", "on-hold": "on_hold", "onhold": "on_hold", "hold": "on_hold",
    "paused": "on_hold", "pending": "on_hold", "stalled": "on_hold", "blocked": "on_hold",
}

# Substring fallback rules, checked in this order (most specific first) when
# the exact-match lookup above misses. Each tuple is (keywords, canonical_status).
STATUS_SUBSTRING_RULES = [
    (("hold", "pause", "stall", "block", "wait", "suspend", "defer"), "on_hold"),
    (("drop", "cancel", "abandon", "terminat", "scrap", "reject", "kill"), "dropped"),
    (("complet", "done", "finish", "close", "deliver", "shipped"), "completed"),
    (("active", "progress", "ongoing", "open", "start", "live", "running"), "active"),
]


def _clean_text(value: Any) -> "str | None":
    """Returns a stripped string, or None for blank/NaN/'nan' values."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    text = str(value).strip()
    if not text or text.lower() == "nan":
        return None
    return text


def _canonical_status(raw_value: Any) -> str:
    key = str(raw_value or "active").strip().lower().replace(" ", "_")
    if key in STATUS_VALUE_MAP:
        return STATUS_VALUE_MAP[key]

    # Fall back to substring matching against the raw (space-preserved,
    # just lowercased/stripped) text, so multi-word statuses like
    # "On Hold - Client Delay" still match on "hold".
    loose = str(raw_value or "").strip().lower()
    for keywords, status in STATUS_SUBSTRING_RULES:
        if any(kw in loose for kw in keywords) or any(kw in key for kw in keywords):
            return status

    return "active"


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Rename source columns to canonical names using keyword-aware matching.
    If more than one source column maps to the same canonical name (e.g. a
    dataset that mixes "Deadline" and "End Date" across different rows,
    which is common with JSON exports where each record's keys can vary),
    the resulting duplicate columns are coalesced into one - keeping the
    first non-null value per row - instead of silently dropping data.
    """
    canon_names: Dict[Any, str] = {}
    for col in df.columns:
        canon = _canonical_field(col)
        if canon:
            canon_names[col] = canon

    if not canon_names:
        return df

    # Group original columns by their target canonical name.
    groups: Dict[str, List[Any]] = {}
    for orig, canon in canon_names.items():
        groups.setdefault(canon, []).append(orig)

    result = df.drop(columns=list(canon_names.keys()))
    for canon, orig_cols in groups.items():
        if len(orig_cols) == 1:
            result[canon] = df[orig_cols[0]]
        else:
            # Coalesce left-to-right: first non-null value across the
            # duplicate columns wins for each row.
            combined = df[orig_cols[0]]
            for extra in orig_cols[1:]:
                combined = combined.combine_first(df[extra])
            result[canon] = combined
    return result


def _parse_date(value) -> "datetime.date | None":
    if pd.isna(value) or value in ("", None):
        return None
    if isinstance(value, datetime):
        return value.date()
    try:
        return pd.to_datetime(value).date()
    except Exception:
        return None


def _rows_from_table(header: List[str], body: List[List[Any]]) -> List[Dict[str, Any]]:
    """Shared helper: zip a header row with body rows, then map through canonical field matching."""
    canon_header = [_canonical_field(h) if h else None for h in header]
    rows = []
    for record in body:
        clean = {}
        for canon, v in zip(canon_header, record):
            if canon:
                clean[canon] = v
        if clean:
            rows.append(clean)
    return rows


def parse_excel(file_bytes: bytes, filename: str = "") -> List[Dict[str, Any]]:
    """Parse an .xlsx or legacy .xls file into a list of normalized row dicts."""
    engine = "xlrd" if filename.lower().endswith(".xls") else "openpyxl"
    df = pd.read_excel(io.BytesIO(file_bytes), engine=engine)
    df = _normalize_columns(df)
    return df.to_dict(orient="records")


def parse_csv(file_bytes: bytes) -> List[Dict[str, Any]]:
    """Parse a .csv file into a list of normalized row dicts."""
    df = pd.read_csv(io.BytesIO(file_bytes))
    df = _normalize_columns(df)
    return df.to_dict(orient="records")


def parse_docx(file_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Parse a Word (.docx) file by reading every table in the document.
    The first row of each table is treated as the header row. Documents
    that store data as prose rather than tables are not supported - ask
    the user to include the data as a table for reliable parsing.
    """
    doc = Document(io.BytesIO(file_bytes))
    rows: List[Dict[str, Any]] = []
    for table in doc.tables:
        if len(table.rows) < 2:
            continue
        grid = [[cell.text.strip() for cell in row.cells] for row in table.rows]
        header, *body = grid
        rows.extend(_rows_from_table(header, body))
    return rows


def parse_pdf(file_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Parse a PDF file by extracting every well-formed table found on each
    page. Assumes the first row of each table is a header row.
    """
    rows: List[Dict[str, Any]] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables():
                if not table or len(table) < 2:
                    continue
                header, *body = table
                rows.extend(_rows_from_table(header, body))
    return rows


def parse_txt_or_tsv(file_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Parse a plain-text delimited file (.txt or .tsv). Auto-detects the
    delimiter (comma, tab, semicolon, or pipe) using csv.Sniffer, falling
    back to whitespace-splitting if sniffing fails.
    """
    import csv as _csv

    text = file_bytes.decode("utf-8", errors="ignore")
    sample = text[:2048]
    try:
        dialect = _csv.Sniffer().sniff(sample, delimiters=",\t;|")
        sep = dialect.delimiter
    except _csv.Error:
        sep = None  # let pandas fall back to whitespace splitting

    df = pd.read_csv(io.StringIO(text), sep=sep, engine="python")
    df = _normalize_columns(df)
    return df.to_dict(orient="records")


def parse_json(file_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Parse a .json file. Accepts either a top-level list of row objects, or
    a dict with a "data"/"rows"/"projects" key containing that list.
    """
    import json as _json

    payload = _json.loads(file_bytes.decode("utf-8", errors="ignore"))
    if isinstance(payload, dict):
        for key in ("data", "rows", "projects", "records"):
            if key in payload and isinstance(payload[key], list):
                payload = payload[key]
                break
    if not isinstance(payload, list):
        raise ValueError("JSON file must contain a list of row objects (or a dict with a 'data'/'rows' key holding one).")

    df = pd.DataFrame(payload)
    df = _normalize_columns(df)
    return df.to_dict(orient="records")


def parse_rtf(file_bytes: bytes) -> List[Dict[str, Any]]:
    """Parse a .rtf file by stripping RTF markup down to plain text, then
    treating it as delimited text (same auto-detection as parse_txt_or_tsv)."""
    from striprtf.striprtf import rtf_to_text

    text = rtf_to_text(file_bytes.decode("utf-8", errors="ignore"))
    return parse_txt_or_tsv(text.encode("utf-8"))


def _sniff_and_parse(file_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Best-effort fallback for files with an unrecognized or missing
    extension: try each parser in turn based on the file's actual byte
    content, so a reasonably-formed file still works even if its
    extension is wrong, unusual, or absent.
    """
    head = file_bytes[:8]
    # ZIP-based formats (.xlsx/.docx) start with "PK\x03\x04"
    if head.startswith(b"PK\x03\x04"):
        try:
            return parse_excel(file_bytes)
        except Exception:
            pass
        try:
            return parse_docx(file_bytes)
        except Exception:
            pass
    # PDF files start with "%PDF"
    if head.startswith(b"%PDF"):
        return parse_pdf(file_bytes)
    # Legacy .xls (OLE2) header
    if head.startswith(b"\xd0\xcf\x11\xe0"):
        return parse_excel(file_bytes, filename=".xls")
    # Try JSON
    try:
        return parse_json(file_bytes)
    except Exception:
        pass
    # Fall back to delimited text
    return parse_txt_or_tsv(file_bytes)


def parse_file(filename: str, file_bytes: bytes) -> List[Dict[str, Any]]:
    """Single entry point: dispatches to the right parser based on file
    extension, with a content-sniffing fallback for unrecognized ones."""
    lower = filename.lower()

    if lower.endswith(".doc"):
        raise ValueError(
            "Legacy .doc files (Word 97-2003) are not supported directly. "
            "Please re-save the file as .docx (File > Save As > Word Document) and upload again."
        )

    if lower.endswith(".xlsx") or lower.endswith(".xls"):
        return parse_excel(file_bytes, filename)
    if lower.endswith(".csv"):
        return parse_csv(file_bytes)
    if lower.endswith(".tsv"):
        return parse_txt_or_tsv(file_bytes)
    if lower.endswith(".txt"):
        return parse_txt_or_tsv(file_bytes)
    if lower.endswith(".json"):
        return parse_json(file_bytes)
    if lower.endswith(".rtf"):
        return parse_rtf(file_bytes)
    if lower.endswith(".docx"):
        return parse_docx(file_bytes)
    if lower.endswith(".pdf"):
        return parse_pdf(file_bytes)

    # Unknown/missing extension: sniff the actual content instead of failing outright.
    try:
        return _sniff_and_parse(file_bytes)
    except Exception as exc:
        raise ValueError(
            f"Unsupported or unrecognized file format ({exc}). "
            f"Supported types: {', '.join(SUPPORTED_EXTENSIONS)}."
        )


def segregate_rows(rows: List[Dict[str, Any]]) -> Dict[str, list]:
    """
    Takes normalized rows (one row per employee-project pairing, typically)
    and segregates them into three clean lists ready for DB insertion:
      - employees: deduplicated by (name, email)
      - projects:  deduplicated by name
      - assignments: (employee_name, project_name) pairs with metadata

    An employee row with an empty project_name is still added to the
    employees list, but produces no assignment -> they surface later as
    "unassigned" automatically (no Assignment row references them).
    """
    employees: Dict[str, Dict[str, Any]] = {}
    projects: Dict[str, Dict[str, Any]] = {}
    assignments: List[Dict[str, Any]] = []

    for row in rows:
        emp_name = str(row.get("employee_name") or "").strip()
        proj_name = str(row.get("project_name") or "").strip()

        if emp_name and emp_name.lower() != "nan":
            if emp_name not in employees:
                employees[emp_name] = {
                    "name": emp_name,
                    "email": row.get("email") or None,
                    "role": row.get("role") or None,
                }

        if proj_name and proj_name.lower() != "nan":
            if proj_name not in projects:
                status_raw = _canonical_status(row.get("status"))
                progress_raw = row.get("progress_percent")
                progress_val = 0.0
                if progress_raw not in (None, "") and not (isinstance(progress_raw, float) and pd.isna(progress_raw)):
                    try:
                        parsed = float(str(progress_raw).replace("%", "").strip())
                        if not pd.isna(parsed):
                            progress_val = parsed
                    except (ValueError, TypeError):
                        progress_val = 0.0
                progress_val = max(0.0, min(100.0, progress_val))
                phase_val = _clean_text(row.get("phase"))
                manager_val = _clean_text(row.get("project_manager"))
                projects[proj_name] = {
                    "name": proj_name,
                    "start_date": _parse_date(row.get("start_date")),
                    "deadline": _parse_date(row.get("deadline")),
                    "actual_completion_date": _parse_date(row.get("actual_completion_date")),
                    "status": status_raw,
                    "progress_percent": progress_val,
                    "phase": phase_val,
                    "project_manager": manager_val,
                }

        # Only create an assignment when BOTH an employee and a project are present
        if emp_name and proj_name and emp_name.lower() != "nan" and proj_name.lower() != "nan":
            assignments.append({
                "employee_name": emp_name,
                "project_name": proj_name,
                "assigned_date": _parse_date(row.get("assigned_date")) or _parse_date(row.get("start_date")),
                "role_on_project": row.get("role_on_project") or None,
            })

    return {
        "employees": list(employees.values()),
        "projects": list(projects.values()),
        "assignments": assignments,
    }
