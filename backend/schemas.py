from datetime import datetime
from pydantic import BaseModel, Field, model_validator

class QuestionInput(BaseModel):
    text: str = Field(min_length=1)
    option_a: str = Field(min_length=1)
    option_b: str = Field(min_length=1)
    option_c: str = Field(min_length=1)
    option_d: str = Field(min_length=1)
    correct_answer: str
    marks: int = Field(gt=0)
    position: int = 0

class Question(QuestionInput):
    id: int
    class Config: from_attributes = True

class AssessmentBase(BaseModel):
    name: str = Field(min_length=1)
    subject: str = Field(min_length=1)
    description: str = Field(min_length=1)
    due_date: str = Field(min_length=1)
    time_limit: int = Field(gt=0)
    passing_marks: int = Field(gt=0)
    status: str
    marks: int = Field(gt=0)
    @model_validator(mode="after")
    def valid_marks(self):
        if self.passing_marks > self.marks: raise ValueError("Passing marks cannot exceed total marks")
        return self

class AssessmentCreate(AssessmentBase):
    questions: list[QuestionInput] = []
class AssessmentUpdate(AssessmentCreate): pass
class Assessment(AssessmentBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None
    class Config: from_attributes = True
class AssessmentDetail(Assessment):
    questions: list[Question] = []

class SubmissionCreate(BaseModel):
    intern_id: str = "default-intern"
    answers: dict[int, str] = {}
    time_taken: int = Field(ge=0)
class SubmissionResult(BaseModel):
    id: int; score: int; percentage: int; passed: bool; correct_answers: int; wrong_answers: int; time_taken: int
    assessment_name: str
