"""
Pydantic schemas used for API request/response validation and serialization.
Keeping these separate from the SQLAlchemy models keeps the API contract
stable even if the DB schema changes internally.
"""
from datetime import date
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class EmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: Optional[str] = None
    role: Optional[str] = None


class EmployeeCreate(BaseModel):
    """Payload for manually adding a new person from the People page, as an
    alternative to them only appearing via a dataset upload. Only `name`
    is required; email and role can be filled in immediately or later."""
    name: str
    email: Optional[str] = None
    role: Optional[str] = None


class TeamMemberOut(BaseModel):
    employee_id: int
    name: str
    role_on_project: Optional[str] = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    actual_completion_date: Optional[date] = None
    status: str
    progress_percent: float
    phase: Optional[str] = None
    project_manager: Optional[str] = None
    drop_reason: Optional[str] = None
    is_overdue: bool = False
    days_overdue: Optional[int] = None
    completed_early: bool = False
    days_early: Optional[int] = None
    team: List[TeamMemberOut] = []


class ProjectUpdate(BaseModel):
    """Fields a manager can change from the Projects page. All optional so
    the frontend can PATCH just the field being edited (status, progress,
    dates, phase, project manager, or a drop reason) without resending the
    whole project."""
    status: Optional[str] = None
    progress_percent: Optional[float] = None
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    phase: Optional[str] = None
    project_manager: Optional[str] = None
    drop_reason: Optional[str] = None
    actual_completion_date: Optional[date] = None


class ProjectCreate(BaseModel):
    """Payload for manually creating a new project from the Projects page
    (as opposed to via a bulk dataset upload). Only `name` is required;
    everything else has a sensible default so a project can be created
    quickly and filled in further afterward."""
    name: str
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    status: Optional[str] = "active"
    progress_percent: Optional[float] = 0
    phase: Optional[str] = None
    project_manager: Optional[str] = None
    employee_ids: List[int] = []


class AssignmentCreate(BaseModel):
    """Payload for adding one or more existing people to a project's team
    from the project detail drawer."""
    employee_ids: List[int]
    role_on_project: Optional[str] = None


class DashboardSummary(BaseModel):
    total_projects: int
    active_projects: int
    completed_projects: int
    overdue_projects: int
    dropped_projects: int
    on_hold_projects: int
    unassigned_people: int


class UploadResult(BaseModel):
    message: str
    employees_created: int
    projects_created: int
    assignments_created: int
    dashboard: DashboardSummary
