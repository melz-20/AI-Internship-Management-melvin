from pydantic import BaseModel, EmailStr


# ---------- USER ----------

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    username: str
    email: EmailStr


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


# ---------- SETTINGS ----------

class SettingsUpdate(BaseModel):
    theme: str
    notifications: bool


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True


# ---------- CHAT ----------

class ChatCreate(BaseModel):
    question: str
    answer: str


class ChatResponse(BaseModel):
    id: int
    question: str
    answer: str

    class Config:
        from_attributes = True


# ---------- UPLOAD ----------

class UploadResponse(BaseModel):
    id: int
    filename: str

    class Config:
        from_attributes = True