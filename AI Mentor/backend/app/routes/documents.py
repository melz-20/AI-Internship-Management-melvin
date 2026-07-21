import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from jose import jwt
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import User, Upload
from app.utils.pdf_reader import extract_text_from_pdf
from app.utils.text_splitter import split_text
from app.vectorstore.faiss_store import rebuild_vector_store

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

SECRET_KEY = "AI_MENTOR_SECRET_KEY"
ALGORITHM = "HS256"

security = HTTPBearer()

UPLOAD_FOLDER = "uploads"


def get_current_user_from_token(
    credentials: HTTPAuthorizationCredentials,
    db: Session
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


@router.get("")
def list_documents(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    user = get_current_user_from_token(credentials, db)

    documents = (
        db.query(Upload)
        .filter(Upload.user_id == user.id)
        .order_by(Upload.created_at.desc())
        .all()
    )

    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "uploaded_at": doc.created_at
        }
        for doc in documents
    ]


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    user = get_current_user_from_token(credentials, db)

    document = (
        db.query(Upload)
        .filter(
            Upload.id == document_id,
            Upload.user_id == user.id
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    # Remove the actual file from disk, if it exists
    if document.stored_filename:
        file_path = os.path.join(UPLOAD_FOLDER, document.stored_filename)

        if os.path.exists(file_path):
            os.remove(file_path)

    # Delete the DB record first, so the "remaining PDFs" query
    # below correctly excludes the one we just removed
    db.delete(document)
    db.commit()

    # Rebuild the user's FAISS index from whatever PDFs are left.
    # FAISS can't remove individual vectors, so a full rebuild from
    # the remaining files is the only reliable way to make the
    # deleted PDF's content actually stop showing up in chat answers.
    remaining_documents = (
        db.query(Upload)
        .filter(Upload.user_id == user.id)
        .all()
    )

    all_chunks = []

    for remaining_doc in remaining_documents:
        remaining_path = os.path.join(
            UPLOAD_FOLDER,
            remaining_doc.stored_filename
        )

        if not os.path.exists(remaining_path):
            # File is missing on disk for some reason -- skip it
            # rather than crashing the whole rebuild.
            continue

        text = extract_text_from_pdf(remaining_path)
        chunks = split_text(text)
        all_chunks.extend(chunks)

    rebuild_vector_store(user.id, all_chunks)

    return {
        "success": True,
        "message": "Document deleted successfully.",
        "remaining_documents": len(remaining_documents)
    }


@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    user = get_current_user_from_token(credentials, db)

    document = (
        db.query(Upload)
        .filter(
            Upload.id == document_id,
            Upload.user_id == user.id
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    file_path = os.path.join(UPLOAD_FOLDER, document.stored_filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="File missing on server."
        )

    return FileResponse(
        path=file_path,
        filename=document.filename,
        media_type="application/pdf"
    )
