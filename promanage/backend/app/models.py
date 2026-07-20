"""
SQLAlchemy ORM models for ProManage.

Three core entities:
- Employee:   a person who can be assigned to projects
- Project:    a body of work with a deadline and status
- Assignment: the join table linking Employees to Projects (many-to-many)
"""
from sqlalchemy import (
    Column, Integer, String, Date, Float, ForeignKey, DateTime, func
)
from sqlalchemy.orm import relationship
import enum

from .database import Base


class ProjectStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    dropped = "dropped"
    on_hold = "on_hold"
    # NOTE: "overdue" is intentionally NOT a stored status.
    # It is always computed at read-time from deadline vs. today's date,
    # so it can never go stale. See app/routes/dashboard.py -> is_overdue().
    #
    # NOTE ON STORAGE: Project.status below is a plain String column, not a
    # SQLAlchemy/SQL Enum. A SQL Enum creates a CHECK constraint baked into
    # the table at creation time - on SQLite that means adding a new status
    # value later (like on_hold was) silently breaks inserts against any
    # database file created before the change, since the old CHECK
    # constraint doesn't know about the new value. A plain String avoids
    # that entire class of bug; validity is enforced in the API layer
    # instead (see ProjectUpdate handling and the parser's status mapping).


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    email = Column(String, unique=True, nullable=True, index=True)
    role = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assignments = relationship(
        "Assignment", back_populates="employee", cascade="all, delete-orphan"
    )


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    start_date = Column(Date, nullable=True)
    deadline = Column(Date, nullable=True)
    actual_completion_date = Column(Date, nullable=True)
    status = Column(String, nullable=False, default=ProjectStatus.active.value)
    progress_percent = Column(Float, nullable=False, default=0)
    phase = Column(String, nullable=True)
    project_manager = Column(String, nullable=True)
    drop_reason = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assignments = relationship(
        "Assignment", back_populates="project", cascade="all, delete-orphan"
    )


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    assigned_date = Column(Date, nullable=True)
    role_on_project = Column(String, nullable=True)

    employee = relationship("Employee", back_populates="assignments")
    project = relationship("Project", back_populates="assignments")
