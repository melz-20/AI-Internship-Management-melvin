# ProManage — Project Management Dashboard

A full-stack project management dashboard. Upload an Excel (`.xlsx`/`.xls`),
CSV (`.csv`), TSV/plain text (`.tsv`/`.txt`), JSON (`.json`), Rich Text
(`.rtf`), Word (`.docx`), or PDF (`.pdf`) dataset containing project and
employee data; the backend parses it, segregates it into Employees /
Projects / Assignments, stores it in a database, and the frontend renders a
live, interactive experience across five pages — **Dashboard**, **Projects**,
**People**, **Reports**, and **Upload Data** — all driven by that data.

- **Backend:** Python, FastAPI, SQLAlchemy, Pandas, OpenPyXL, pdfplumber, python-docx
- **Frontend:** React (Vite), Tailwind CSS, Recharts, react-dropzone, lucide-react

---

## 1. Prerequisites

Install these once, if you don't already have them:

- **Python 3.10+** → https://www.python.org/downloads/ (check "Add Python to PATH" during install)
- **Node.js 18+** (includes npm) → https://nodejs.org/

Verify both are installed by opening **PowerShell** and running:

```powershell
python --version
node --version
npm --version
```

---

## 2. Project Structure

```
promanage/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entrypoint
│   │   ├── database.py       # SQLAlchemy engine/session
│   │   ├── models.py         # Employee, Project, Assignment tables
│   │   ├── schemas.py        # Pydantic response models
│   │   ├── parser.py         # Excel/PDF parsing + segregation logic
│   │   └── routes/
│   │       ├── upload.py     # POST /api/upload
│   │       └── dashboard.py  # GET dashboard/projects/employees/charts
│   ├── requirements.txt
│   └── generate_sample_data.py   # optional: creates a test dataset
└── frontend/
    ├── src/
    │   ├── components/       # Sidebar, StatCard, FileUploader, ProjectDrawer, tables, charts
    │   ├── pages/             # Dashboard, Projects, People, Reports, UploadData
    │   ├── context/DataContext.jsx  # shared data store used by every page
    │   ├── pages/Dashboard.jsx
    │   ├── api/client.js     # Axios calls to the backend
    │   └── App.jsx
    ├── tailwind.config.js    # Purple/white theme tokens
    └── package.json
```

---

## 3. Backend Setup (PowerShell)

Open PowerShell and run these commands **one at a time**, from the folder where you unzipped this project:

```powershell
# 1. Go into the backend folder
cd promanage\backend

# 2. Create a virtual environment
python -m venv venv

# 3. Activate it
.\venv\Scripts\Activate.ps1
```

> If step 3 gives an execution-policy error, run this once (in the same PowerShell window) and then retry step 3:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

```powershell
# 4. Install backend dependencies
pip install -r requirements.txt

# 5. (Optional) Generate a sample dataset to test the upload immediately
python generate_sample_data.py

# 6. Start the backend server
uvicorn app.main:app --reload --port 8010
```

You should see `Uvicorn running on http://127.0.0.1:8010`. Leave this PowerShell window open.
Visit **http://127.0.0.1:8010/docs** to see the interactive API documentation (Swagger UI).

> **Why port 8010, not 8000?** Port 8000 is the default for several other common tools (Django, various local dev servers), so it's frequently already taken. 8010 avoids that collision. If 8010 is also busy on your machine, see the Troubleshooting section below for how to switch to any other free port.

---

## 4. Frontend Setup (PowerShell)

Open a **second, separate** PowerShell window (keep the backend running in the first one):

```powershell
# 1. Go into the frontend folder
cd promanage\frontend

# 2. Install frontend dependencies
npm install

# 3. Start the dev server
npm run dev
```

You should see something like `Local: http://localhost:5173/`.

Open that URL in your browser — this is the ProManage dashboard.

---

## 5. Using the App

1. Go to the **Upload Data** page from the sidebar and drag your dataset (`.xlsx`, `.xls`, `.csv`, `.tsv`, `.txt`, `.json`, `.rtf`, `.docx`, or `.pdf`) onto the upload zone (or click to browse). A status banner confirms the backend is reachable before you upload.
   - If you generated `sample_data.xlsx` in step 3.5 above, upload that file to see the dashboard populate immediately.
2. The backend parses the file, segregates rows into Employees / Projects / Assignments, and saves them.
3. Every page updates automatically: the **Dashboard** (summary cards, Monthly Project Progress Overview, Project Summary (Year) Trend, projects table, upcoming deadlines, people lists), the **Projects** page (filterable table + detail drawer for editing progress/status), the **People** page (role and assignment-status filters), and the **Reports** page (Completed Early vs Late, Dropped Projects, Excel export).
4. Upload additional files at any time — matching project/employee names are updated in place rather than duplicated.
5. Need to start fresh? Use **Clear All Data** at the bottom of the Upload Data page.

---

## 6. Expected Spreadsheet Columns

The parser recognizes many real-world header variations automatically (not just exact matches) - for example, a "Deadline" column can also be named "End Date" or "Due Date"; a "Progress %" column can be named "Completion%", "% Complete", or just "%". One row per employee-project pairing is the clearest format:

| Column | Required | Notes |
|---|---|---|
| Project Name | Yes (for project rows) | |
| Start Date | Recommended | Any common date format |
| Deadline | Recommended | Also recognized as "End Date" or "Due Date" |
| Actual Completion Date | Only for completed projects | |
| Status | Recommended | `Active`, `Completed`, `Dropped`/`Cancelled`, or `On Hold`/`Paused` (defaults to Active) - any casing works |
| Progress % | Recommended | Also recognized as "Completion%", "% Complete", or a bare "%" column. Number 0–100 |
| Phase | Optional | Free text, e.g. Planning, Development, Testing, Review |
| Employee Name | Yes (for assignment rows) | Leave blank for an unassigned employee row |
| Email | Optional | |
| Role | Optional | Employee's job title |
| Assigned Date | Optional | Defaults to Start Date if blank |
| Role on Project | Optional | e.g. Lead, Contributor, Reviewer |

To list an employee with **no** project (so they show up in "People Not
Assigned to Any Project"), add a row with their Employee Name filled in and
Project Name left blank.

> **Upgrading from an earlier version?** This release added the `on_hold` status and a `phase` column to the Project table. Since this is a local SQLite database that doesn't auto-migrate, delete `promanage.db` in the `backend` folder once before restarting the server, so it gets recreated with the new schema. (You'll need to re-upload your dataset afterward - export first via Reports > Export to Excel if you want to keep a copy.)

---

## 7. Stopping the App

In each PowerShell window, press `Ctrl + C` to stop the server. To deactivate the Python virtual environment in the backend window:

```powershell
deactivate
```

---

## 8. Troubleshooting

**Upload fails with "Not Found":** this means a server responded, but not with the ProManage API. Go to the **Upload Data** page — a status banner at the top will now tell you exactly what's wrong (backend not running vs. a different app using port 8010) and how to fix it. As a quick manual check, open **http://127.0.0.1:8010/docs** in your browser: you should see "ProManage API" as the page title. If you see something else, or the page won't load at all, the backend either isn't running or isn't on port 8010 — see rows below.

| Issue | Fix |
|---|---|
| Upload fails with "Not Found" / "Can't reach the backend" | Make sure `uvicorn app.main:app --reload --port 8010` is running in a PowerShell window (section 3). Visit http://127.0.0.1:8010/docs to confirm it's really the ProManage API answering on that port — if another app is using port 8010, either stop it or run the backend on a different port and set `VITE_API_BASE_URL` in a `.env` file inside `frontend/` to match (e.g. `VITE_API_BASE_URL=http://127.0.0.1:8001`) |
| `uvicorn` not recognized | Make sure you activated the venv (`.\venv\Scripts\Activate.ps1`) before running it |
| CORS error in browser console | The backend already allows any `localhost`/`127.0.0.1` port, so this is rare — if it still happens, confirm you're opening the frontend via `http://localhost:5173` (not by double-clicking a file) |
| `npm install` fails | Delete `node_modules` and `package-lock.json`, then re-run `npm install` |
| Execution policy error activating venv | Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` once, then retry |
| Upload says "Unsupported or unrecognized file format" | Supported types: `.xlsx`, `.xls`, `.csv`, `.tsv`, `.txt`, `.json`, `.rtf`, `.docx`, `.pdf`. Legacy `.doc` isn't supported — re-save as `.docx` first |
