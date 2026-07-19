"""REST API routes for student management and reporting."""

from datetime import date, datetime

import mysql.connector
from flask import Blueprint, current_app, jsonify, request, send_from_directory, url_for
from werkzeug.exceptions import HTTPException

from database import get_db_connection
from report_generator import generate_range_docx, generate_range_pdf, generate_student_report, report_summary


api = Blueprint("api", __name__)

STUDENT_FIELDS = (
    "student_name",
    "department",
    "company",
    "attendance",
    "task_completion",
    "mentor_rating",
    "communication",
    "project_completion",
)
PERCENTAGE_FIELDS = (
    "attendance",
    "task_completion",
    "communication",
    "project_completion",
)


def success(data, status=200):
    """Create a successful JSON response."""
    return jsonify({"success": True, "data": data}), status


def error(message, status=400):
    """Create a consistent JSON error response."""
    return jsonify({"success": False, "message": message}), status


def serialize_student(student):
    """Convert MySQL dates to JSON-safe ISO values."""
    for key, value in student.items():
        if isinstance(value, (date, datetime)):
            student[key] = value.isoformat()
    return student


def calculate_performance(data):
    """Validate metrics and calculate score plus performance category."""
    values = {}
    for field in PERCENTAGE_FIELDS:
        try:
            values[field] = float(data[field])
        except (KeyError, TypeError, ValueError):
            raise ValueError(f"{field} must be a number.") from None
        if not 0 <= values[field] <= 100:
            raise ValueError(f"{field} must be between 0 and 100.")

    try:
        values["mentor_rating"] = float(data["mentor_rating"])
    except (KeyError, TypeError, ValueError):
        raise ValueError("mentor_rating must be a number.") from None
    if not 1 <= values["mentor_rating"] <= 5:
        raise ValueError("mentor_rating must be between 1 and 5.")

    score = round(
        (
            values["attendance"]
            + values["task_completion"]
            + values["communication"]
            + values["project_completion"]
            + values["mentor_rating"] * 20
        )
        / 5,
        2,
    )
    if score >= 90:
        category = "Outstanding"
    elif score >= 80:
        category = "Excellent"
    elif score >= 70:
        category = "Good"
    elif score >= 60:
        category = "Satisfactory"
    else:
        category = "Needs Improvement"

    return values, score, category


def validate_student_data(data):
    """Validate text fields and return values ready for insertion."""
    for field in ("student_name", "department", "company"):
        if not isinstance(data.get(field), str) or not data[field].strip():
            raise ValueError(f"{field} is required.")
    values, score, category = calculate_performance(data)
    values.update(
        {
            "student_name": data["student_name"].strip(),
            "department": data["department"].strip(),
            "company": data["company"].strip(),
        }
    )
    return values, score, category


def normalize_payload(data):
    """Accept the current frontend's name field as a student_name alias."""
    normalized = dict(data)
    if "student_name" not in normalized and "name" in normalized:
        normalized["student_name"] = normalized["name"]
    return normalized


def get_student(student_id):
    """Fetch one student or return None."""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM students WHERE student_id = %s", (student_id,))
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()


@api.get("/")
def index():
    return "Backend Running"


@api.get("/dashboard")
def dashboard_summary():
    """Return dashboard metrics calculated from the students table."""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_students,
                COALESCE(SUM(performance_category = 'Outstanding'), 0) AS outstanding,
                COALESCE(SUM(performance_category = 'Excellent'), 0) AS excellent,
                COALESCE(SUM(performance_category = 'Good'), 0) AS good,
                COALESCE(SUM(performance_category = 'Satisfactory'), 0) AS satisfactory,
                COALESCE(SUM(performance_category = 'Needs Improvement'), 0)
                    AS needs_improvement,
                COALESCE(ROUND(AVG(overall_score), 2), 0) AS average_score
            FROM students
            """
        )
        summary = cursor.fetchone()
        cursor.close()
        connection.close()
        for field in (
            "total_students",
            "outstanding",
            "excellent",
            "good",
            "satisfactory",
            "needs_improvement",
        ):
            summary[field] = int(summary[field])
        summary["average_score"] = float(summary["average_score"])
        return success(summary)
    except mysql.connector.Error:
        return error("Unable to retrieve dashboard data.", 500)


@api.get("/students")
def list_students():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM students ORDER BY student_id DESC")
        students = [serialize_student(student) for student in cursor.fetchall()]
        cursor.close()
        connection.close()
        return success(students)
    except mysql.connector.Error:
        return error("Unable to retrieve students.", 500)


@api.get("/analytics/performance")
def performance_analytics():
    """Return a count of students in every performance category."""
    categories = {
        "outstanding": 0,
        "excellent": 0,
        "good": 0,
        "satisfactory": 0,
        "needs_improvement": 0,
    }
    category_keys = {
        "Outstanding": "outstanding",
        "Excellent": "excellent",
        "Good": "good",
        "Satisfactory": "satisfactory",
        "Needs Improvement": "needs_improvement",
    }
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT performance_category, COUNT(*) AS student_count
            FROM students
            GROUP BY performance_category
            """
        )
        for row in cursor.fetchall():
            key = category_keys.get(row["performance_category"])
            if key:
                categories[key] = int(row["student_count"])
        cursor.close()
        connection.close()
        return success(categories)
    except mysql.connector.Error:
        return error("Unable to retrieve performance analytics.", 500)


@api.get("/analytics/departments")
def department_analytics():
    """Return the number of students grouped by department."""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT department, COUNT(*) AS student_count
            FROM students
            GROUP BY department
            ORDER BY department
            """
        )
        departments = cursor.fetchall()
        cursor.close()
        connection.close()
        for department in departments:
            department["student_count"] = int(department["student_count"])
        return success(departments)
    except mysql.connector.Error:
        return error("Unable to retrieve department analytics.", 500)


@api.get("/analytics/companies")
def company_analytics():
    """Return the number of students grouped by internship company."""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT company, COUNT(*) AS student_count
            FROM students
            GROUP BY company
            ORDER BY company
            """
        )
        companies = cursor.fetchall()
        cursor.close()
        connection.close()
        for company in companies:
            company["student_count"] = int(company["student_count"])
        return success(companies)
    except mysql.connector.Error:
        return error("Unable to retrieve company analytics.", 500)


@api.get("/analytics/average-score")
def average_score_analytics():
    """Return average overall scores grouped by department."""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT department, ROUND(AVG(overall_score), 2) AS average_score
            FROM students
            GROUP BY department
            ORDER BY department
            """
        )
        averages = cursor.fetchall()
        cursor.close()
        connection.close()
        for average in averages:
            average["average_score"] = float(average["average_score"])
        return success(averages)
    except mysql.connector.Error:
        return error("Unable to retrieve average score analytics.", 500)


@api.get("/students/<int:student_id>")
def retrieve_student(student_id):
    try:
        student = get_student(student_id)
    except mysql.connector.Error:
        return error("Unable to retrieve student.", 500)
    if student is None:
        return error("Student not found.", 404)
    return success(serialize_student(student))


@api.post("/students")
def create_student():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("A JSON request body is required.")
    try:
        data = normalize_payload(data)
        values, score, category = validate_student_data(data)
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO students (
                student_name, department, company, attendance, task_completion,
                mentor_rating, communication, project_completion, overall_score,
                performance_category
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                values["student_name"], values["department"], values["company"],
                values["attendance"], values["task_completion"],
                values["mentor_rating"], values["communication"],
                values["project_completion"], score, category,
            ),
        )
        student_id = cursor.lastrowid
        connection.commit()
        cursor.close()
        connection.close()
        return success(serialize_student(get_student(student_id)), 201)
    except ValueError as exc:
        return error(str(exc))
    except mysql.connector.Error:
        return error("Unable to create student.", 500)


@api.put("/students/<int:student_id>")
def update_student(student_id):
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("A JSON request body is required.")
    try:
        data = normalize_payload(data)
        existing = get_student(student_id)
        if existing is None:
            return error("Student not found.", 404)
        merged = {field: data.get(field, existing[field]) for field in STUDENT_FIELDS}
        values, score, category = validate_student_data(merged)
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            UPDATE students
            SET student_name = %s, department = %s, company = %s, attendance = %s,
                task_completion = %s, mentor_rating = %s, communication = %s,
                project_completion = %s, overall_score = %s,
                performance_category = %s
            WHERE student_id = %s
            """,
            (
                values["student_name"], values["department"], values["company"],
                values["attendance"], values["task_completion"],
                values["mentor_rating"], values["communication"],
                values["project_completion"], score, category, student_id,
            ),
        )
        connection.commit()
        cursor.close()
        connection.close()
        return success(serialize_student(get_student(student_id)))
    except ValueError as exc:
        return error(str(exc))
    except mysql.connector.Error:
        return error("Unable to update student.", 500)


@api.delete("/students/<int:student_id>")
def delete_student(student_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM students WHERE student_id = %s", (student_id,))
        connection.commit()
        deleted = cursor.rowcount
        cursor.close()
        connection.close()
    except mysql.connector.Error:
        return error("Unable to delete student.", 500)
    if not deleted:
        return error("Student not found.", 404)
    return jsonify({"success": True, "message": "Student deleted successfully."})


@api.post("/generate-report/<int:student_id>")
def create_report(student_id):
    try:
        student = get_student(student_id)
    except mysql.connector.Error:
        return error("Unable to retrieve student.", 500)
    if student is None:
        return error("Student not found.", 404)
    try:
        filename = generate_student_report(student, current_app.config["REPORTS_DIR"])
    except OSError:
        return error("Unable to generate report.", 500)
    return success(
        {
            "file_name": filename,
            "download_url": url_for("api.download_report", filename=filename, _external=True),
        },
        201,
    )


def get_report_range():
    """Validate report dates and retrieve student records created in that period."""
    try:
        start_date = datetime.strptime(request.args.get("start_date", ""), "%Y-%m-%d").date()
        end_date = datetime.strptime(request.args.get("end_date", ""), "%Y-%m-%d").date()
    except ValueError:
        raise ValueError("start_date and end_date must use YYYY-MM-DD format.") from None
    if end_date < start_date:
        raise ValueError("end_date cannot be before start_date.")
    connection = get_db_connection(); cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM students WHERE DATE(created_at) BETWEEN %s AND %s ORDER BY created_at DESC", (start_date, end_date))
        return start_date.isoformat(), end_date.isoformat(), [serialize_student(student) for student in cursor.fetchall()]
    finally:
        cursor.close(); connection.close()


@api.get("/reports")
def preview_range_report():
    try:
        start_date, end_date, students = get_report_range()
        return success({"students": students, "summary": report_summary(students), "generated_date": datetime.now().isoformat(), "selected_date_range": {"start_date": start_date, "end_date": end_date}})
    except ValueError as exc:
        return error(str(exc))
    except mysql.connector.Error:
        return error("Unable to retrieve report data.", 500)


@api.get("/reports/pdf")
def download_range_pdf():
    try:
        start_date, end_date, students = get_report_range(); filename = generate_range_pdf(students, start_date, end_date, current_app.config["REPORTS_DIR"])
        return send_from_directory(current_app.config["REPORTS_DIR"], filename, as_attachment=True)
    except ValueError as exc:
        return error(str(exc))
    except (mysql.connector.Error, OSError):
        return error("Unable to generate PDF report.", 500)


@api.get("/reports/docx")
def download_range_docx():
    try:
        start_date, end_date, students = get_report_range(); filename = generate_range_docx(students, start_date, end_date, current_app.config["REPORTS_DIR"])
        return send_from_directory(current_app.config["REPORTS_DIR"], filename, as_attachment=True)
    except ValueError as exc:
        return error(str(exc))
    except (mysql.connector.Error, OSError):
        return error("Unable to generate DOCX report.", 500)


@api.get("/reports/<path:filename>")
def download_report(filename):
    return send_from_directory(current_app.config["REPORTS_DIR"], filename, as_attachment=True)


@api.app_errorhandler(Exception)
def handle_unexpected_error(exception):
    """Return JSON for routes, HTTP methods, and unexpected server failures."""
    if isinstance(exception, HTTPException):
        return error(exception.description, exception.code)
    current_app.logger.exception("Unhandled API error")
    return error("An unexpected server error occurred.", 500)
