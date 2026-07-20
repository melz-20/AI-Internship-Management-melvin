from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import crud, models, schemas
from database import Base, engine, get_db

Base.metadata.create_all(bind=engine)
with engine.begin() as connection:
    existing = {row[1] for row in connection.exec_driver_sql("PRAGMA table_info(assessments)")}
    additions = {"description": "TEXT NOT NULL DEFAULT ''", "time_limit": "INTEGER NOT NULL DEFAULT 30", "passing_marks": "INTEGER NOT NULL DEFAULT 1", "created_at": "DATETIME", "updated_at": "DATETIME"}
    for name, definition in additions.items():
        if name not in existing:
            connection.exec_driver_sql(f"ALTER TABLE assessments ADD COLUMN {name} {definition}")
    # Records created by the earlier CRUD app had no description.  Keep them
    # usable while the API enforces descriptions for all new assessments.
    connection.exec_driver_sql(
        "UPDATE assessments SET description = 'No description provided' "
        "WHERE description IS NULL OR TRIM(description) = ''"
    )

app = FastAPI(title="Assessment Management API")
app.add_middleware(CORSMiddleware, allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+", allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def home(): return {"message": "Assessment Management API is running!"}

@app.get("/assessments", response_model=list[schemas.Assessment])
def all_assessments(db: Session = Depends(get_db)): return crud.get_assessments(db)

@app.get("/assessments/{assessment_id}", response_model=schemas.AssessmentDetail)
def detail(assessment_id: int, db: Session = Depends(get_db)):
    item = crud.get_assessment(db, assessment_id)
    if not item: raise HTTPException(404, "Assessment not found")
    return item

@app.post("/assessments", response_model=schemas.Assessment)
def create(data: schemas.AssessmentCreate, db: Session = Depends(get_db)): return crud.create_assessment(db, data)

@app.put("/assessments/{assessment_id}", response_model=schemas.Assessment)
def update(assessment_id: int, data: schemas.AssessmentUpdate, db: Session = Depends(get_db)):
    item = crud.update_assessment(db, assessment_id, data)
    if not item: raise HTTPException(404, "Assessment not found")
    return item

@app.delete("/assessments/{assessment_id}")
def delete(assessment_id: int, db: Session = Depends(get_db)):
    if not crud.delete_assessment(db, assessment_id): raise HTTPException(404, "Assessment not found")
    return {"message": "Assessment deleted successfully"}

@app.post("/assessments/{assessment_id}/submit", response_model=schemas.SubmissionResult)
def submit(assessment_id: int, data: schemas.SubmissionCreate, db: Session = Depends(get_db)):
    assessment = crud.get_assessment(db, assessment_id)
    if not assessment: raise HTTPException(404, "Assessment not found")
    result = crud.submit(db, assessment, data)
    if not result: raise HTTPException(409, "Only one attempt is allowed")
    return {"id": result.id, "score": result.score, "percentage": result.percentage, "passed": bool(result.passed), "correct_answers": result.correct_answers, "wrong_answers": result.wrong_answers, "time_taken": result.time_taken, "assessment_name": assessment.name}

@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    assessments = crud.get_assessments(db)
    submissions = db.query(models.Submission).all()
    scores = [submission.percentage for submission in submissions]
    subject = {}
    for submission in submissions:
        subject.setdefault(submission.assessment.subject, []).append(submission.percentage)

    recent = [
        {
            "assessment": submission.assessment.name,
            "score": submission.percentage,
            "passed": bool(submission.passed),
            "completed_at": submission.completed_at,
        }
        for submission in submissions[-5:]
    ]
    return {
        "total": len(assessments),
        "active": sum(item.status == "Active" for item in assessments),
        "pending": sum(item.status == "Pending" for item in assessments),
        # A completed assessment means the intern has submitted it.  Counting
        # submissions (rather than an admin-managed status) makes this metric
        # update automatically after the timed assessment is finished.
        "completed": len({item.assessment_id for item in submissions}),
        "average_score": round(sum(scores) / len(scores)) if scores else 0,
        "pass_percentage": round(sum(item.passed for item in submissions) / len(submissions) * 100) if submissions else 0,
        "latest_score": scores[-1] if scores else 0,
        "upcoming": sum(item.status in ["Active", "Pending"] for item in assessments),
        "attempts": len(submissions),
        "subject_progress": [{"subject": key, "score": round(sum(values) / len(values))} for key, values in subject.items()],
        "recent": recent,
    }
