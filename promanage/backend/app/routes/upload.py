"""
POST /api/upload

Accepts a dataset in Excel (.xlsx/.xls), CSV (.csv), Word (.docx), or PDF
(.pdf) format, parses it, segregates the data into Employees / Projects /
Assignments, persists it, and returns a unified dashboard payload so the
frontend can render immediately after upload.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Employee, Project, Assignment
from ..parser import parse_file, segregate_rows, SUPPORTED_EXTENSIONS
from ..schemas import UploadResult
from .dashboard import build_dashboard_summary

router = APIRouter()


@router.get("/api/upload/formats")
def supported_formats():
    """Returns the list of currently supported upload file extensions, so the
    frontend's format guide and dropzone `accept` list stay in sync with the
    backend without needing to be hand-maintained in two places."""
    return {"extensions": list(SUPPORTED_EXTENSIONS)}


@router.post("/api/upload", response_model=UploadResult)
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = file.filename or "uploaded_file"

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    try:
        rows = parse_file(filename, file_bytes)
    except ValueError as exc:
        # Known, user-facing parsing problems (wrong format, .doc, malformed JSON, etc.)
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {exc}")

    if not rows:
        raise HTTPException(
            status_code=422,
            detail=(
                "No recognizable data rows were found in the uploaded file. "
                "For Word documents, make sure the data is in a table. "
                "For any format, check that column headers match the expected names "
                "(see README section 6)."
            ),
        )

    segregated = segregate_rows(rows)

    # --- Persist Employees (upsert by name) ---
    # Pre-fetch every existing employee whose name appears in this upload in
    # ONE query, instead of one query per row. For a few thousand rows this
    # is the difference between an upload taking seconds vs. under a second.
    incoming_emp_names = [e["name"] for e in segregated["employees"]]
    existing_employees = {
        e.name: e
        for e in db.query(Employee).filter(Employee.name.in_(incoming_emp_names)).all()
    } if incoming_emp_names else {}

    employee_lookup = {}
    for emp in segregated["employees"]:
        existing = existing_employees.get(emp["name"])
        if existing:
            existing.email = emp["email"] or existing.email
            existing.role = emp["role"] or existing.role
            employee_lookup[emp["name"]] = existing
        else:
            new_emp = Employee(name=emp["name"], email=emp["email"], role=emp["role"])
            db.add(new_emp)
            employee_lookup[emp["name"]] = new_emp
    if segregated["employees"]:
        db.flush()  # assign IDs to newly-added employees before assignments reference them
    employees_created = len(segregated["employees"])

    # --- Persist Projects (upsert by name) ---
    incoming_proj_names = [p["name"] for p in segregated["projects"]]
    existing_projects = {
        p.name: p
        for p in db.query(Project).filter(Project.name.in_(incoming_proj_names)).all()
    } if incoming_proj_names else {}

    project_lookup = {}
    for proj in segregated["projects"]:
        existing = existing_projects.get(proj["name"])
        if existing:
            existing.start_date = proj["start_date"] or existing.start_date
            existing.deadline = proj["deadline"] or existing.deadline
            existing.actual_completion_date = (
                proj["actual_completion_date"] or existing.actual_completion_date
            )
            existing.status = proj["status"]
            existing.progress_percent = proj["progress_percent"]
            existing.phase = proj["phase"] or existing.phase
            existing.project_manager = proj["project_manager"] or existing.project_manager
            project_lookup[proj["name"]] = existing
        else:
            new_proj = Project(
                name=proj["name"],
                start_date=proj["start_date"],
                deadline=proj["deadline"],
                actual_completion_date=proj["actual_completion_date"],
                status=proj["status"],
                progress_percent=proj["progress_percent"],
                phase=proj["phase"],
                project_manager=proj["project_manager"],
            )
            db.add(new_proj)
            project_lookup[proj["name"]] = new_proj
    if segregated["projects"]:
        db.flush()  # assign IDs to newly-added projects before assignments reference them
    projects_created = len(segregated["projects"])

    # --- Ensure Project Managers exist as real Employees ---
    # A "Project Manager" column holds a person's name, so that person
    # should show up on the People page like anyone else, not just as a
    # text label on the project. Pre-fetch any manager names not already
    # covered by the employees upsert above, in one query.
    pm_names_needed = {
        proj["project_manager"] for proj in segregated["projects"]
        if proj.get("project_manager") and proj["project_manager"] not in employee_lookup
    }
    pm_employees_created = 0
    if pm_names_needed:
        existing_pm_employees = {
            e.name: e for e in db.query(Employee).filter(Employee.name.in_(pm_names_needed)).all()
        }
        for pm_name in pm_names_needed:
            existing = existing_pm_employees.get(pm_name)
            if existing:
                employee_lookup[pm_name] = existing
            else:
                new_pm_emp = Employee(name=pm_name, role="Project Manager")
                db.add(new_pm_emp)
                employee_lookup[pm_name] = new_pm_emp
                pm_employees_created += 1
        db.flush()
    employees_created += pm_employees_created

    # Synthesize an assignment row for each project's manager, so they show
    # up in that project's team roster too. These are merged into the same
    # assignments list below so the existing dedup logic (existing_pairs /
    # new_pairs_seen) applies to them automatically.
    pm_assignment_rows = [
        {
            "employee_name": proj["project_manager"],
            "project_name": proj["name"],
            "assigned_date": proj["start_date"],
            "role_on_project": "Project Manager",
        }
        for proj in segregated["projects"]
        if proj.get("project_manager")
    ]
    all_assignment_rows = segregated["assignments"] + pm_assignment_rows

    # --- Persist Assignments (skip duplicates) ---
    # Same fix here: fetch all assignments touching these employees/projects
    # in one query and check membership in-memory, rather than one SELECT
    # per candidate assignment row.
    emp_ids = [e.id for e in employee_lookup.values()]
    proj_ids = [p.id for p in project_lookup.values()]
    existing_pairs = set()
    if emp_ids and proj_ids:
        existing_pairs = {
            (a.employee_id, a.project_id)
            for a in db.query(Assignment)
            .filter(Assignment.employee_id.in_(emp_ids), Assignment.project_id.in_(proj_ids))
            .all()
        }

    assignments_created = 0
    new_pairs_seen = set()  # guards against duplicate rows within the same upload
    for a in all_assignment_rows:
        emp = employee_lookup.get(a["employee_name"])
        proj = project_lookup.get(a["project_name"])
        if not emp or not proj:
            continue
        pair = (emp.id, proj.id)
        if pair in existing_pairs or pair in new_pairs_seen:
            continue
        db.add(Assignment(
            employee_id=emp.id,
            project_id=proj.id,
            assigned_date=a["assigned_date"],
            role_on_project=a["role_on_project"],
        ))
        new_pairs_seen.add(pair)
        assignments_created += 1

    db.commit()

    dashboard = build_dashboard_summary(db)

    return UploadResult(
        message=f"Successfully processed '{filename}'.",
        employees_created=employees_created,
        projects_created=projects_created,
        assignments_created=assignments_created,
        dashboard=dashboard,
    )
