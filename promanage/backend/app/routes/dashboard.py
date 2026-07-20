"""
Dashboard, Projects, and Employees read endpoints.

All "overdue" logic is computed at read-time (deadline < today AND
status != completed) rather than stored, so it is always accurate.
"""
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, selectinload
import io
import pandas as pd

from ..database import get_db
from ..models import Employee, Project, Assignment, ProjectStatus
from ..schemas import ProjectOut, TeamMemberOut, EmployeeOut, EmployeeCreate, DashboardSummary, ProjectUpdate, ProjectCreate, AssignmentCreate

router = APIRouter()


def _projects_query(db: Session):
    """
    Base query for Project that eager-loads assignments + the employee on
    each assignment in a couple of extra queries total, instead of lazily
    firing one query per project per row when `_project_to_out` later reads
    `project.assignments` - the classic N+1 problem. For a few thousand
    projects this is the difference between ~2.5s and well under 200ms.
    """
    return db.query(Project).options(
        selectinload(Project.assignments).selectinload(Assignment.employee)
    )


def is_overdue(project: Project) -> bool:
    # A project can only be overdue while it is still being actively pursued.
    # "completed", "dropped", and "on_hold" are all states where the clock
    # isn't meaningfully running against the team, so none of them should
    # ever register as overdue.
    if project.status in (ProjectStatus.completed, ProjectStatus.dropped, ProjectStatus.on_hold):
        return False
    if not project.deadline:
        return False
    return project.deadline < date.today()


def days_overdue(project: Project) -> Optional[int]:
    if not is_overdue(project):
        return None
    return (date.today() - project.deadline).days


def is_completed_early(project: Project) -> bool:
    if project.status != ProjectStatus.completed:
        return False
    if not project.deadline or not project.actual_completion_date:
        return False
    return project.actual_completion_date < project.deadline


def days_early(project: Project) -> Optional[int]:
    if not is_completed_early(project):
        return None
    return (project.deadline - project.actual_completion_date).days


def _resolve_project_manager(project: Project, team: list) -> Optional[str]:
    """
    Returns the project's manager: prefers an explicit `project_manager`
    value parsed from the dataset (e.g. a "Project Manager" column), then
    falls back to scanning the team roster for anyone whose role *on this
    project* contains "manager" or "lead", and finally falls back to each
    assigned employee's general job-title role (their `Role` column from
    the dataset) - so a project still shows a manager even when the
    dataset only ever expresses this via a person's job title rather than
    a dedicated Project Manager column or a per-project role field.
    """
    if project.project_manager:
        return project.project_manager
    for member in team:
        role = (member.role_on_project or "").lower()
        if "manager" in role or "lead" in role:
            return member.name
    for a in project.assignments:
        if a.employee and a.employee.role:
            role = a.employee.role.lower()
            if "manager" in role or "lead" in role:
                return a.employee.name
    return None


def _project_to_out(project: Project) -> ProjectOut:
    team = [
        TeamMemberOut(
            employee_id=a.employee_id,
            name=a.employee.name if a.employee else "Unknown",
            role_on_project=a.role_on_project,
        )
        for a in project.assignments
    ]
    return ProjectOut(
        id=project.id,
        name=project.name,
        start_date=project.start_date,
        deadline=project.deadline,
        actual_completion_date=project.actual_completion_date,
        status=project.status.value if hasattr(project.status, "value") else project.status,
        progress_percent=project.progress_percent,
        phase=project.phase,
        project_manager=_resolve_project_manager(project, team),
        drop_reason=project.drop_reason,
        is_overdue=is_overdue(project),
        days_overdue=days_overdue(project),
        completed_early=is_completed_early(project),
        days_early=days_early(project),
        team=team,
    )


def build_dashboard_summary(db: Session) -> DashboardSummary:
    all_projects = db.query(Project).all()
    total = len(all_projects)
    active = sum(1 for p in all_projects if p.status == ProjectStatus.active)
    completed = sum(1 for p in all_projects if p.status == ProjectStatus.completed)
    dropped = sum(1 for p in all_projects if p.status == ProjectStatus.dropped)
    on_hold = sum(1 for p in all_projects if p.status == ProjectStatus.on_hold)
    overdue = sum(1 for p in all_projects if is_overdue(p))

    all_employees = db.query(Employee).all()
    assigned_employee_ids = {a.employee_id for a in db.query(Assignment).all()}
    unassigned = sum(1 for e in all_employees if e.id not in assigned_employee_ids)

    return DashboardSummary(
        total_projects=total,
        active_projects=active,
        completed_projects=completed,
        overdue_projects=overdue,
        dropped_projects=dropped,
        on_hold_projects=on_hold,
        unassigned_people=unassigned,
    )


@router.get("/api/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return build_dashboard_summary(db)


@router.get("/api/projects", response_model=List[ProjectOut])
def list_projects(
    status: Optional[str] = Query(None, description="active | completed | dropped | on_hold | overdue"),
    db: Session = Depends(get_db),
):
    query = _projects_query(db)
    if status == "overdue":
        projects = [p for p in query.all() if is_overdue(p)]
    elif status in ("active", "completed", "dropped", "on_hold"):
        projects = query.filter(Project.status == status).all()
    else:
        projects = query.all()
    return [_project_to_out(p) for p in projects]


def _ensure_employee(db: Session, name: str, default_role: Optional[str] = None) -> Employee:
    """Finds an existing employee by exact name, or creates one. Used so a
    Project Manager entered by name (whether via upload or manual project
    creation) always exists as a real Employee record and therefore shows
    up on the People page, instead of being a plain string floating
    outside the Employee table."""
    emp = db.query(Employee).filter(Employee.name == name).first()
    if emp:
        return emp
    emp = Employee(name=name, role=default_role)
    db.add(emp)
    db.flush()
    return emp


@router.post("/api/projects", response_model=ProjectOut, status_code=201)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    """
    Creates a new project directly from the Projects page, as an
    alternative to bulk dataset upload. Only `name` is required; start
    date, deadline, phase, project manager, and an initial team can all be
    filled in immediately or left for later editing.
    """
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Project name is required")

    if db.query(Project).filter(Project.name == name).first():
        raise HTTPException(status_code=409, detail=f"A project named '{name}' already exists")

    status = payload.status if payload.status in ("active", "completed", "dropped", "on_hold") else "active"
    progress = payload.progress_percent if payload.progress_percent is not None else 0
    if not (0 <= progress <= 100):
        raise HTTPException(status_code=422, detail="progress_percent must be between 0 and 100")

    if payload.start_date and payload.deadline and payload.deadline < payload.start_date:
        raise HTTPException(status_code=422, detail="Deadline cannot be before the start date")

    manager_name = payload.project_manager.strip() if payload.project_manager else None

    project = Project(
        name=name,
        start_date=payload.start_date,
        deadline=payload.deadline,
        status=status,
        progress_percent=progress,
        phase=payload.phase,
        project_manager=manager_name,
    )
    db.add(project)
    db.flush()

    # The project manager is a real person - make sure they exist as an
    # Employee and are assigned to this project, so they show up on the
    # People page and in the team roster, not just as a text label.
    if manager_name:
        pm_employee = _ensure_employee(db, manager_name, default_role="Project Manager")
        already_assigned = (
            db.query(Assignment)
            .filter(Assignment.employee_id == pm_employee.id, Assignment.project_id == project.id)
            .first()
        )
        if not already_assigned:
            db.add(Assignment(
                employee_id=pm_employee.id,
                project_id=project.id,
                assigned_date=project.start_date,
                role_on_project="Project Manager",
            ))

    for emp_id in payload.employee_ids:
        emp = db.query(Employee).filter(Employee.id == emp_id).first()
        if not emp:
            continue
        already_assigned = (
            db.query(Assignment)
            .filter(Assignment.employee_id == emp.id, Assignment.project_id == project.id)
            .first()
        )
        if not already_assigned:
            db.add(Assignment(employee_id=emp.id, project_id=project.id, assigned_date=project.start_date))

    db.commit()
    db.refresh(project)
    return _project_to_out(_projects_query(db).filter(Project.id == project.id).first())


@router.get("/api/projects/completed-early", response_model=List[ProjectOut])
def completed_early_report(db: Session = Depends(get_db)):
    """Early Completion Report: projects finished before their deadline."""
    projects = _projects_query(db).filter(Project.status == ProjectStatus.completed).all()
    early = [p for p in projects if is_completed_early(p)]
    early.sort(key=lambda p: days_early(p) or 0, reverse=True)
    return [_project_to_out(p) for p in early]


@router.get("/api/projects/dropped", response_model=List[ProjectOut])
def dropped_projects_report(db: Session = Depends(get_db)):
    """Dropped Projects report, including the captured drop_reason."""
    projects = _projects_query(db).filter(Project.status == ProjectStatus.dropped).all()
    return [_project_to_out(p) for p in projects]


@router.get("/api/projects/on-hold", response_model=List[ProjectOut])
def on_hold_projects_report(db: Session = Depends(get_db)):
    """On-Hold Projects report: projects currently paused, not actively being worked."""
    projects = _projects_query(db).filter(Project.status == ProjectStatus.on_hold).all()
    return [_project_to_out(p) for p in projects]


@router.get("/api/projects/overdue-report", response_model=List[ProjectOut])
def overdue_projects_report(db: Session = Depends(get_db)):
    """Overdue Projects report, sorted by how many days overdue (most urgent first)."""
    projects = [p for p in _projects_query(db).all() if is_overdue(p)]
    projects.sort(key=lambda p: days_overdue(p) or 0, reverse=True)
    return [_project_to_out(p) for p in projects]


# NOTE: this catch-all-by-id route must be registered AFTER the specific
# string routes above (/completed-early, /dropped) - FastAPI matches routes
# in registration order, so a more general path here would otherwise
# intercept those requests first and fail int-conversion on project_id.
@router.get("/api/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = _projects_query(db).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _project_to_out(project)


@router.get("/api/employees", response_model=List[EmployeeOut])
def list_employees(
    unassigned_only: bool = Query(False),
    db: Session = Depends(get_db),
):
    employees = db.query(Employee).all()
    if unassigned_only:
        assigned_ids = {a.employee_id for a in db.query(Assignment).all()}
        employees = [e for e in employees if e.id not in assigned_ids]
    return employees


@router.post("/api/employees", response_model=EmployeeOut, status_code=201)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    """
    Adds a new person directly from the People page, as an alternative to
    them only ever appearing via a dataset upload. Only `name` is
    required; email and role can be filled in immediately or later. They
    show up as "Unassigned" right away, same as anyone else with no
    project yet.
    """
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Name is required")

    if db.query(Employee).filter(Employee.name == name).first():
        raise HTTPException(status_code=409, detail=f"A person named '{name}' already exists")

    email = payload.email.strip() if payload.email else None
    role = payload.role.strip() if payload.role else None

    employee = Employee(name=name, email=email, role=role)
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@router.get("/api/employees/{employee_id}/assignments", response_model=List[ProjectOut])
def get_employee_assignments(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    project_ids = [a.project_id for a in employee.assignments]
    projects = _projects_query(db).filter(Project.id.in_(project_ids)).all()
    return [_project_to_out(p) for p in projects]


@router.get("/api/reports/team-workload")
def team_workload_report(db: Session = Depends(get_db)):
    """
    Team Workload report: how many projects each employee is currently
    assigned to, sorted busiest-first, so a manager can spot overloaded or
    idle team members at a glance without digging through the People page.
    """
    employees = db.query(Employee).all()
    assignments = db.query(Assignment).all()

    counts: dict = {}
    for a in assignments:
        counts[a.employee_id] = counts.get(a.employee_id, 0) + 1

    result = [
        {
            "employee_id": e.id,
            "name": e.name,
            "role": e.role,
            "project_count": counts.get(e.id, 0),
        }
        for e in employees
    ]
    result.sort(key=lambda r: r["project_count"], reverse=True)
    return result


@router.get("/api/charts/monthly-progress")
def monthly_progress_chart(db: Session = Depends(get_db)):
    """
    Powers the 'Monthly Project Progress Overview' stacked bar chart.
    Buckets projects by the calendar month of their start_date and returns,
    per month, how many projects are active/completed/dropped/overdue - so
    the frontend can render a stacked bar (and filter to a single month via
    a dropdown) without any client-side math.
    """
    projects = db.query(Project).all()
    buckets: dict = {}

    for p in projects:
        if not p.start_date:
            continue
        month_key = p.start_date.strftime("%Y-%m")
        buckets.setdefault(month_key, {"active": 0, "completed": 0, "dropped": 0, "overdue": 0, "on_hold": 0})
        if is_overdue(p):
            buckets[month_key]["overdue"] += 1
        elif p.status == ProjectStatus.completed:
            buckets[month_key]["completed"] += 1
        elif p.status == ProjectStatus.dropped:
            buckets[month_key]["dropped"] += 1
        elif p.status == ProjectStatus.on_hold:
            buckets[month_key]["on_hold"] += 1
        else:
            buckets[month_key]["active"] += 1

    sorted_months = sorted(buckets.keys())
    result = []
    for m in sorted_months:
        label = date.fromisoformat(f"{m}-01").strftime("%b %Y")
        result.append({"month": m, "label": label, **buckets[m]})
    return result


@router.get("/api/charts/yearly-trend")
def yearly_trend_chart(db: Session = Depends(get_db)):
    """
    Powers the 'Project Summary (Year) Trend' bar chart: for each calendar
    year (based on start_date), returns the total number of projects
    started that year, broken down by how many ended up completed,
    dropped, or are still active - i.e. a per-year summary of projects
    done, rendered as grouped bars rather than a cumulative line.
    """
    projects = db.query(Project).all()
    yearly: dict = {}

    for p in projects:
        if not p.start_date:
            continue
        year = str(p.start_date.year)
        yearly.setdefault(year, {"total": 0, "completed": 0, "dropped": 0, "active": 0, "on_hold": 0})
        yearly[year]["total"] += 1
        if p.status == ProjectStatus.completed:
            yearly[year]["completed"] += 1
        elif p.status == ProjectStatus.dropped:
            yearly[year]["dropped"] += 1
        elif p.status == ProjectStatus.on_hold:
            yearly[year]["on_hold"] += 1
        else:
            yearly[year]["active"] += 1

    sorted_years = sorted(yearly.keys())
    return [{"year": y, **yearly[y]} for y in sorted_years]


@router.patch("/api/projects/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, update: ProjectUpdate, db: Session = Depends(get_db)):
    """
    Powers the Projects page actions: mark completed, drop (with a
    mandatory reason), or edit progress. Only the fields provided in the
    request body are changed.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if update.status is not None:
        if update.status not in ("active", "completed", "dropped", "on_hold"):
            raise HTTPException(status_code=422, detail="status must be active, completed, dropped, or on_hold")
        if update.status == "dropped" and not (update.drop_reason or project.drop_reason):
            raise HTTPException(status_code=422, detail="A drop_reason is required when dropping a project")
        project.status = update.status
        if update.status == "completed" and not project.actual_completion_date:
            project.actual_completion_date = update.actual_completion_date or date.today()
            project.progress_percent = 100

    if update.progress_percent is not None:
        if not (0 <= update.progress_percent <= 100):
            raise HTTPException(status_code=422, detail="progress_percent must be between 0 and 100")
        project.progress_percent = update.progress_percent

    if update.start_date is not None:
        project.start_date = update.start_date

    if update.deadline is not None:
        project.deadline = update.deadline

    if project.start_date and project.deadline and project.deadline < project.start_date:
        raise HTTPException(status_code=422, detail="Deadline cannot be before the start date")

    if update.phase is not None:
        project.phase = update.phase

    if update.project_manager is not None:
        project.project_manager = update.project_manager

    if update.drop_reason is not None:
        project.drop_reason = update.drop_reason

    if update.actual_completion_date is not None:
        project.actual_completion_date = update.actual_completion_date

    db.commit()
    db.refresh(project)
    return _project_to_out(project)


@router.post("/api/projects/{project_id}/assignments", response_model=ProjectOut)
def add_project_members(project_id: int, payload: AssignmentCreate, db: Session = Depends(get_db)):
    """
    Adds one or more existing people to a project's team, from the project
    detail drawer. Silently skips anyone already on the team (no duplicate
    assignments) and ignores any employee_id that doesn't exist, so a
    partially-stale selection on the frontend can't fail the whole request.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not payload.employee_ids:
        raise HTTPException(status_code=422, detail="At least one employee_id is required")

    existing_ids = {a.employee_id for a in project.assignments}
    added = 0
    for emp_id in payload.employee_ids:
        if emp_id in existing_ids:
            continue
        emp = db.query(Employee).filter(Employee.id == emp_id).first()
        if not emp:
            continue
        db.add(Assignment(
            employee_id=emp.id,
            project_id=project.id,
            assigned_date=date.today(),
            role_on_project=payload.role_on_project,
        ))
        existing_ids.add(emp_id)
        added += 1

    db.commit()
    db.refresh(project)
    return _project_to_out(_projects_query(db).filter(Project.id == project_id).first())


@router.delete("/api/projects/{project_id}/assignments/{employee_id}", response_model=ProjectOut)
def remove_project_member(project_id: int, employee_id: int, db: Session = Depends(get_db)):
    """Removes one person from a project's team (does not delete the
    Employee record itself - they may still be assigned elsewhere)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    assignment = (
        db.query(Assignment)
        .filter(Assignment.project_id == project_id, Assignment.employee_id == employee_id)
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=404, detail="This person is not assigned to this project")

    db.delete(assignment)
    db.commit()
    return _project_to_out(_projects_query(db).filter(Project.id == project_id).first())


@router.get("/api/reports/export")
def export_projects_excel(db: Session = Depends(get_db)):
    """
    Exports all projects (with computed overdue/early flags) to an Excel
    file using Pandas + OpenPyXL, for offline sharing with leadership.
    """
    projects = _projects_query(db).all()
    rows = []
    for p in projects:
        out = _project_to_out(p)
        rows.append({
            "Project Name": out.name,
            "Start Date": out.start_date,
            "Deadline": out.deadline,
            "Actual Completion Date": out.actual_completion_date,
            "Status": out.status,
            "Phase": out.phase,
            "Project Manager": out.project_manager,
            "Progress %": out.progress_percent,
            "Overdue": "Yes" if out.is_overdue else "No",
            "Days Overdue": out.days_overdue,
            "Completed Early": "Yes" if out.completed_early else "No",
            "Days Early": out.days_early,
            "Drop Reason": out.drop_reason,
            "Team": ", ".join(m.name for m in out.team),
        })
    df = pd.DataFrame(rows)
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Projects")
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=promanage_projects_export.xlsx"},
    )


@router.delete("/api/admin/reset")
def reset_all_data(db: Session = Depends(get_db)):
    """
    Clears all Employees, Projects, and Assignments. Used by the Settings
    page's 'Clear all data' action so a user can start over with a fresh
    upload without needing shell/database access.
    """
    db.query(Assignment).delete()
    db.query(Project).delete()
    db.query(Employee).delete()
    db.commit()
    return {"message": "All data has been cleared."}
