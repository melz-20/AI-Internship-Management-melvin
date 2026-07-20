from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import shutil
import uuid

# Routers
from app.routes.chat import router as chat_router
from app.routes.auth import router as auth_router
from app.routes.history import router as history_router
from app.routes.dashboard import router as dashboard_router
from app.routes.documents import router as documents_router

# PDF & RAG
from app.utils.pdf_reader import extract_text_from_pdf
from app.utils.text_splitter import split_text
from app.vectorstore.faiss_store import create_vector_store

# Database
from app.database.database import engine, get_db
from app.database.models import Base, Upload, User
from app.utils.auth import get_current_user

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Mentor API",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(chat_router)
app.include_router(auth_router)
app.include_router(history_router)
app.include_router(dashboard_router)
app.include_router(documents_router)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "Welcome to AI Mentor Backend 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "Backend Running",
        "version": "1.0"
    }


@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if not file.filename.endswith(".pdf"):
        return {
            "success": False,
            "message": "Only PDF files are allowed."
        }

    # Generate a unique name for disk storage so two users'
    # files with the same name never collide or overwrite each other.
    unique_name = f"{uuid.uuid4().hex}-{file.filename}"

    file_path = os.path.join(
        UPLOAD_FOLDER,
        unique_name
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text
    text = extract_text_from_pdf(file_path)

    # Split text
    chunks = split_text(text)

    # Create Vector Store
    create_vector_store(chunks, current_user.id)

    # Save Upload Record
    new_upload = Upload(
        filename=file.filename,
        stored_filename=unique_name,
        user_id=current_user.id
    )

    db.add(new_upload)
    db.commit()

    return {
        "success": True,
        "filename": file.filename,
        "chunks": len(chunks),
        "message": "PDF uploaded and indexed successfully!"
    }
