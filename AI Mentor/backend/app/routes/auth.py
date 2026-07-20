import os
import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from passlib.context import CryptContext
from jose import jwt, JWTError

from app.database.database import get_db
from app.database.models import User
from app.database.schemas import (
    UserCreate,
    UserLogin,
    UserUpdate,
    ChangePassword,
    SettingsUpdate
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

SECRET_KEY = "AI_MENTOR_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

PROFILE_PICTURE_FOLDER = "profile_pictures"
os.makedirs(PROFILE_PICTURE_FOLDER, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

security = HTTPBearer()


def hash_password(password):
    return pwd_context.hash(password)


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update(
        {
            "exp": expire
        }
    )

    token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    try:

        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token."
        )

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return user


# -----------------------------
# REGISTER
# -----------------------------

@router.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Email already exists."
        )

    new_user = User(

        username=user.username,
        email=user.email,
        password=hash_password(user.password)

    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registration Successful."
    }


# -----------------------------
# LOGIN
# -----------------------------

@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    existing = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    if not verify_password(
        user.password,
        existing.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Incorrect password."
        )

    token = create_access_token(
        {
            "sub": existing.email
        }
    )

    return {

        "access_token": token,

        "token_type": "bearer",

        "username": existing.username

    }


# -----------------------------
# GET PROFILE
# -----------------------------

@router.get("/profile")
def get_profile(
    current_user: User = Depends(get_current_user)
):

    return {

        "username": current_user.username,

        "email": current_user.email,

        "profile_picture": current_user.profile_picture

    }


# -----------------------------
# UPDATE PROFILE
# -----------------------------

@router.put("/profile")
def update_profile(
    updated_user: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    existing_email = (
        db.query(User)
        .filter(
            User.email == updated_user.email,
            User.id != current_user.id
        )
        .first()
    )

    if existing_email:

        raise HTTPException(
            status_code=400,
            detail="Email already exists."
        )

    current_user.username = updated_user.username
    current_user.email = updated_user.email

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully.",
        "username": current_user.username,
        "email": current_user.email,
        "profile_picture": current_user.profile_picture
    }


# -----------------------------
# UPLOAD PROFILE PICTURE
# -----------------------------

@router.post("/profile-picture")
def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if file.content_type not in ALLOWED_IMAGE_TYPES:

        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG or WEBP images are allowed."
        )

    # Remove the old picture from disk, if there was one
    if current_user.profile_picture:

        old_path = os.path.join(
            PROFILE_PICTURE_FOLDER,
            current_user.profile_picture
        )

        if os.path.exists(old_path):
            os.remove(old_path)

    extension = file.filename.split(".")[-1]
    unique_name = f"{uuid.uuid4().hex}.{extension}"

    file_path = os.path.join(
        PROFILE_PICTURE_FOLDER,
        unique_name
    )

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    current_user.profile_picture = unique_name

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile picture updated successfully.",
        "profile_picture": current_user.profile_picture
    }


# -----------------------------
# SERVE PROFILE PICTURE
# -----------------------------

@router.get("/profile-picture/{filename}")
def get_profile_picture(filename: str):

    file_path = os.path.join(PROFILE_PICTURE_FOLDER, filename)

    if not os.path.exists(file_path):

        raise HTTPException(
            status_code=404,
            detail="Profile picture not found."
        )

    return FileResponse(file_path)


# -----------------------------
# CHANGE PASSWORD
# -----------------------------

@router.put("/change-password")
def change_password(
    passwords: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if not verify_password(
        passwords.current_password,
        current_user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Current password is incorrect."
        )

    current_user.password = hash_password(
        passwords.new_password
    )

    db.commit()

    return {
        "message": "Password changed successfully."
    }


# -----------------------------
# GET SETTINGS
# -----------------------------

@router.get("/settings")
def get_settings(
    current_user: User = Depends(get_current_user)
):

    return {

        "theme": current_user.theme,

        "notifications": current_user.notifications

    }


# -----------------------------
# UPDATE SETTINGS
# -----------------------------

@router.put("/settings")
def update_settings(
    settings: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    current_user.notifications = settings.notifications

    db.commit()
    db.refresh(current_user)

    return {

        "message": "Settings updated successfully.",

        "notifications": current_user.notifications

    }


# -----------------------------
# DELETE ACCOUNT
# -----------------------------

@router.delete("/delete-account")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    db.delete(current_user)
    db.commit()

    return {
        "message": "Account deleted successfully."
    }
