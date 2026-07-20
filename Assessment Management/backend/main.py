
import os
from datetime import date
from fastapi import FastAPI, Depends
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, func, case, Column, Integer, String, Date, ForeignKey, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.orm import declarative_base

# 1. DATABASE CONNECTION CONFIGURATION
DATABASE_URL = "mysql+pymysql://root:guru5527@localhost/internship_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. DEFINE YOUR DATABASE MODELS
class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    batch_id = Column(Integer, ForeignKey("batches.id"))

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    status = Column(String(20))
    date = Column(Date)
class Batch(Base):
    __tablename__ = "batches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))
# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

# Enable CORS so your browser can request database metrics
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. SERVE THE DASHBOARD HTML AT THE ROOT
@app.get("/", response_class=HTMLResponse)
def serve_dashboard():
    html_path = "dashboard.html"
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as file:
            return HTMLResponse(content=file.read(), status_code=200)
    return """
    <html>
        <body style="font-family: sans-serif; text-align: center; padding-top: 100px;">
            <h2>dashboard.html is missing!</h2>
            <p>Please place the dashboard.html file in the same folder as main.py.</p>
        </body>
    </html>
    """

# 4. GET LIVE API DASHBOARD ROUTE (Queries your real MySQL database)
@app.get("/api/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)):
    today = date.today()

    # Query real totals
    total_students = db.query(Student).count()
    
    # Static fallback for mentors and batches if tables aren't set up
    total_mentors = 12
    total_batches = 4

    # Calculate real daily attendance status counts
    present_count = db.query(Attendance).filter(
        Attendance.status == "Present", 
        Attendance.date == today
    ).count()

    absent_count = db.query(Attendance).filter(
        Attendance.status == "Absent", 
        Attendance.date == today
    ).count()

    # Calculate live average attendance percentage
    total_today = present_count + absent_count
    avg_attendance = f"{round((present_count / total_today) * 100, 2)}%" if total_today > 0 else "0.00%"

    # Generate live batch wise statistics
    batches = db.query(Student.batch_id).distinct().all()
    batch_wise_data = []
    for (b_id,) in batches:
        if not b_id:
            continue
        b_students = db.query(Student).filter(Student.batch_id == b_id).count()
        b_present = db.query(Attendance).join(Student).filter(
            Student.batch_id == b_id,
            Attendance.status == "Present",
            Attendance.date == today
        ).count()
        b_absent = db.query(Attendance).join(Student).filter(
            Student.batch_id == b_id,
            Attendance.status == "Absent",
            Attendance.date == today
        ).count()
        b_pct = round((b_present / b_students) * 100, 2) if b_students > 0 else 0.0

        batch_wise_data.append({
            "batch_id": b_id,
            "batch_name": db.query(Batch).filter(Batch.id == b_id).first().name,
            "total_students": b_students,
            "present": b_present,
            "absent": b_absent,
            "average_attendance": b_pct
        })

    # Generate real student leaderboard using standard SQL CASE logic
    top_students_list = []
    try:
        top_students_query = db.query(
            Student.name,
            Student.batch_id,
            func.round(
                (func.sum(case((Attendance.status == 'Present', 1), else_=0)) / func.count(Attendance.id)) * 100, 
                2
            ).label('pct')
        ).join(Attendance, Student.id == Attendance.student_id)\
         .group_by(Student.id, Student.name, Student.batch_id)\
         .order_by(text("pct DESC"))\
         .limit(5)\
         .all()

        top_students_list = [
            {"name": name, "batch_id": b_id, "attendance_percentage": float(pct or 0)}
            for name, b_id, pct in top_students_query
        ]
    except Exception as e:
        print(f"Error querying leaderboard: {e}")

    return {
        "total_students": total_students,
        "total_mentors": total_mentors,
        "total_batches": total_batches,
        "average_attendance": avg_attendance,
        "batch_wise_attendance": batch_wise_data,
        "top_students": top_students_list,
        "attendance_status_counts": {
            "present": present_count,
            "absent": absent_count
        }
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)