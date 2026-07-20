from sqlalchemy.orm import Session
import models, schemas

def get_assessments(db): return db.query(models.Assessment).order_by(models.Assessment.created_at.desc()).all()
def get_assessment(db, assessment_id): return db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
def _questions(db, assessment, questions):
    assessment.questions.clear()
    for index, q in enumerate(questions):
        assessment.questions.append(
            models.Question(**q.model_dump(exclude={"position"}), position=index)
        )
def create_assessment(db, data):
    values = data.model_dump(exclude={"questions"}); item = models.Assessment(**values); db.add(item); db.flush(); _questions(db, item, data.questions); db.commit(); db.refresh(item); return item
def update_assessment(db, assessment_id, data):
    item=get_assessment(db, assessment_id)
    if not item: return None
    for key, value in data.model_dump(exclude={"questions"}).items(): setattr(item,key,value)
    _questions(db,item,data.questions); db.commit(); db.refresh(item); return item
def delete_assessment(db, assessment_id):
    item=get_assessment(db,assessment_id)
    if not item:return None
    db.delete(item); db.commit(); return item
def submit(db, assessment, payload):
    existing=db.query(models.Submission).filter_by(assessment_id=assessment.id, intern_id=payload.intern_id).first()
    if existing: return None
    score=correct=0; answers=[]
    for question in assessment.questions:
        selected=payload.answers.get(question.id) or payload.answers.get(str(question.id))
        right=selected == question.correct_answer
        if right: score += question.marks; correct += 1
        answers.append(models.SubmissionAnswer(question_id=question.id, selected_answer=selected, is_correct=int(right)))
    max_marks=sum(q.marks for q in assessment.questions) or assessment.marks
    result=models.Submission(assessment_id=assessment.id,intern_id=payload.intern_id,score=score,percentage=round(score/max_marks*100) if max_marks else 0,passed=int(score>=assessment.passing_marks),correct_answers=correct,wrong_answers=len(assessment.questions)-correct,time_taken=payload.time_taken,answers=answers)
    db.add(result); db.commit(); db.refresh(result); return result
