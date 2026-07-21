"""
ProManage backend entrypoint.

Run locally with:
    uvicorn app.main:app --reload --port 8010
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routes import upload, dashboard

# Create all tables on startup (fine for SQLite / dev; use Alembic migrations in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ProManage API",
    description="Backend API for the ProManage project management dashboard.",
    version="1.0.0",
)

# Allow the Vite dev server (default port 5173) and preview server (4173) to
# call this API during development, on both localhost and 127.0.0.1. The
# regex also covers any other localhost port, since Vite will auto-increment
# the port (5174, 5175, ...) if 5173 is already in use on your machine.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:4173", "http://127.0.0.1:4173",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, tags=["Upload"])
app.include_router(dashboard.router, tags=["Dashboard"])


@app.get("/")
def root():
    return {"status": "ok", "service": "ProManage API"}


@app.get("/api/health")
def health_check():
    """
    Lightweight liveness check the frontend calls on the Upload Data page to
    confirm it's actually talking to the ProManage backend (and not, say, a
    different service that happens to be running on the same port).
    """
    return {"status": "ok", "service": "ProManage API", "version": "1.0.0"}
