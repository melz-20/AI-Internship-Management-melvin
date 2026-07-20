from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False, default="")
    due_date = Column(String, nullable=False)
    time_limit = Column(Integer, nullable=False, default=30)
    passing_marks = Column(Integer, nullable=False, default=1)
    status = Column(String, nullable=False, default="Pending")
    marks = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    questions = relationship("Question", back_populates="assessment", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="assessment", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_answer = Column(String(1), nullable=False)
    marks = Column(Integer, nullable=False, default=1)
    position = Column(Integer, nullable=False, default=0)
    assessment = relationship("Assessment", back_populates="questions")


class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False, index=True)
    intern_id = Column(String, nullable=False, default="default-intern")
    score = Column(Integer, nullable=False)
    percentage = Column(Integer, nullable=False)
    passed = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    wrong_answers = Column(Integer, nullable=False)
    time_taken = Column(Integer, nullable=False)
    completed_at = Column(DateTime, server_default=func.now())
    assessment = relationship("Assessment", back_populates="submissions")
    answers = relationship("SubmissionAnswer", back_populates="submission", cascade="all, delete-orphan")


class SubmissionAnswer(Base):
    __tablename__ = "submission_answers"
    id = Column(Integer, primary_key=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_answer = Column(String(1), nullable=True)
    is_correct = Column(Integer, nullable=False)
    submission = relationship("Submission", back_populates="answers")
