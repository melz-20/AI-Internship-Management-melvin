from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt
import os

from app.database.database import get_db
from app.database.models import Upload, User

router = APIRouter(
    prefix="/uploads",
    tags=["Study Material"]
)

SECRET_KEY = "AI_MENTOR_SECRET_KEY"
ALGORITHM = "HS256"

security = HTTPBearer()


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

    except Exception:
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
# GET ALL UPLOADED PDFs
# -----------------------------
@router.get("/")
def get_uploads(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    uploads = (
        db.query(Upload)
        .filter(Upload.user_id == current_user.id)
        .order_by(Upload.id.desc())
        .all()
    )

    return uploads


# -----------------------------
# DOWNLOAD PDF
# -----------------------------
@router.get("/download/{upload_id}")
def download_file(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    upload = (
        db.query(Upload)
        .filter(
            Upload.id == upload_id,
            Upload.user_id == current_user.id
        )
        .first()
    )

    if not upload:
        raise HTTPException(
            status_code=404,
            detail="File not found."
        )

    path = os.path.join(
        "uploads",
        upload.filename
    )

    if not os.path.exists(path):
        raise HTTPException(
            status_code=404,
            detail="PDF missing."
        )

    return FileResponse(
        path,
        filename=upload.filename,
        media_type="application/pdf"
    )


# -----------------------------
# DELETE PDF
# -----------------------------
@router.delete("/{upload_id}")
def delete_upload(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    upload = (
        db.query(Upload)
        .filter(
            Upload.id == upload_id,
            Upload.user_id == current_user.id
        )
        .first()
    )

    if not upload:
        raise HTTPException(
            status_code=404,
            detail="File not found."
        )

    path = os.path.join(
        "uploads",
        upload.filename
    )

    if os.path.exists(path):
        os.remove(path)

    db.delete(upload)
    db.commit()

    return {
        "message": "PDF deleted successfully."
    }