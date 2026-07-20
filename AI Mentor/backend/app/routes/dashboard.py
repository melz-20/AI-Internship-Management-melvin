from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database.database import get_db
from app.database.models import User, Chat, Upload

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

SECRET_KEY = "AI_MENTOR_SECRET_KEY"
ALGORITHM = "HS256"

security = HTTPBearer()


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


@router.get("/stats")
def get_dashboard_stats(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    user = get_current_user_from_token(credentials, db)

    total_chats = (
        db.query(Chat)
        .filter(Chat.user_id == user.id)
        .count()
    )

    total_uploads = (
        db.query(Upload)
        .filter(Upload.user_id == user.id)
        .count()
    )

    study_hours = round(total_chats * 0.15, 1)

    return {
        "ai_chats": total_chats,
        "uploaded_pdfs": total_uploads,
        "questions": total_chats,
        "study_hours": study_hours
    }


@router.get("/recent-activity")
def get_recent_activity(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    user = get_current_user_from_token(credentials, db)

    recent_chats = (
        db.query(Chat)
        .filter(Chat.user_id == user.id)
        .order_by(Chat.created_at.desc())
        .limit(5)
        .all()
    )

    recent_uploads = (
        db.query(Upload)
        .filter(Upload.user_id == user.id)
        .order_by(Upload.created_at.desc())
        .limit(5)
        .all()
    )

    activity = []

    for chat in recent_chats:
        activity.append({
            "type": "chat",
            "text": f"Asked: {chat.question[:60]}",
            "time": chat.created_at
        })

    for upload in recent_uploads:
        activity.append({
            "type": "upload",
            "text": f"Uploaded {upload.filename}",
            "time": upload.created_at
        })

    # Sort combined list by time, most recent first
    activity.sort(
        key=lambda item: item["time"] or 0,
        reverse=True
    )

    return activity[:6]


@router.get("/weekly-activity")
def get_weekly_activity(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    user = get_current_user_from_token(credentials, db)

    today = datetime.utcnow().date()
    start_date = today - timedelta(days=6)

    chats = (
        db.query(Chat)
        .filter(
            Chat.user_id == user.id,
            Chat.created_at >= start_date
        )
        .all()
    )

    # Count chats per day
    counts_by_date = {}

    for chat in chats:
        if chat.created_at:
            chat_date = chat.created_at.date()
            counts_by_date[chat_date] = counts_by_date.get(chat_date, 0) + 1

    # Build a full 7-day list, oldest to newest, filling in zeros
    result = []

    for i in range(7):
        day = start_date + timedelta(days=i)

        result.append({
            "day": day.strftime("%a"),      # e.g. "Mon"
            "date": day.strftime("%Y-%m-%d"),
            "count": counts_by_date.get(day, 0)
        })

    return result
