from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field

MentorStatus = Literal['ACTIVE', 'INACTIVE', 'PENDING', 'REJECTED']

class Mentor(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str
    department: str
    expertise: str
    students: int = 0
    status: MentorStatus = 'PENDING'
    joined_at: str = Field(alias='joinedAt')
    last_login: str = Field(alias='lastLogin')
    attendance: int = 0
    performance: int = 0
    avatar: str
    class Config: populate_by_name = True

class MentorCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str = ''
    department: str
    expertise: str

class MentorUpdate(MentorCreate):
    status: MentorStatus | None = None

class Student(BaseModel):
    id: str
    name: str
    email: EmailStr
    department: str
    mentor: str
    mentor_id: str = Field(alias='mentorId')
    internship_status: str = Field(alias='internshipStatus')
    progress: int
    attendance: int
    performance: int
    report_status: str = Field(alias='reportStatus')
    avatar: str
    class Config: populate_by_name = True

class NotificationCreate(BaseModel):
    title: str
    message: str
    audience: Literal['All Mentors', 'All Students', 'All Users', 'Selected Mentors']
    scheduled_at: str | None = Field(default=None, alias='scheduledAt')
    mentor_ids: list[str] = Field(default_factory=list, alias='mentorIds')
    class Config: populate_by_name = True

class Settings(BaseModel):
    theme: Literal['light', 'dark', 'system'] = 'light'
    email_notifications: bool = Field(default=True, alias='emailNotifications')
    login_alerts: bool = Field(default=True, alias='loginAlerts')
    weekly_summary: bool = Field(default=True, alias='weeklySummary')
    two_factor_auth: bool = Field(default=False, alias='twoFactorAuth')
    class Config: populate_by_name = True

class AdminProfile(BaseModel):
    name: str
    email: EmailStr
    phone: str
    role: str
    department: str
    avatar: str

class PasswordChange(BaseModel):
    current_password: str = Field(alias='currentPassword')
    new_password: str = Field(alias='newPassword', min_length=8)
    class Config: populate_by_name = True
