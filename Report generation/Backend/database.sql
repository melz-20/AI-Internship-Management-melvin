CREATE DATABASE IF NOT EXISTS ai_internship_management;
USE ai_internship_management;

CREATE TABLE IF NOT EXISTS students (
    student_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    company VARCHAR(150) NOT NULL,
    attendance DECIMAL(5, 2) NOT NULL,
    task_completion DECIMAL(5, 2) NOT NULL,
    mentor_rating DECIMAL(3, 2) NOT NULL,
    communication DECIMAL(5, 2) NOT NULL,
    project_completion DECIMAL(5, 2) NOT NULL,
    overall_score DECIMAL(5, 2) NOT NULL,
    performance_category VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_attendance CHECK (attendance BETWEEN 0 AND 100),
    CONSTRAINT chk_task_completion CHECK (task_completion BETWEEN 0 AND 100),
    CONSTRAINT chk_mentor_rating CHECK (mentor_rating BETWEEN 1 AND 5),
    CONSTRAINT chk_communication CHECK (communication BETWEEN 0 AND 100),
    CONSTRAINT chk_project_completion CHECK (project_completion BETWEEN 0 AND 100),
    CONSTRAINT chk_overall_score CHECK (overall_score BETWEEN 0 AND 100)
);
