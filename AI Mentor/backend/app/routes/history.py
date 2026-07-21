from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import User, Conversation

router = APIRouter(
    prefix="/history",
    tags=["History"]
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


# -----------------------------
# LIST CONVERSATIONS
# -----------------------------
@router.get("/")
def get_conversations(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    user = get_current_user_from_token(credentials, db)

    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == user.id)
        .order_by(Conversation.created_at.desc())
        .all()
    )

    result = []

    for conversation in conversations:
        message_count = len(conversation.chats)

        last_message = (
            conversation.chats[-1].answer
            if conversation.chats
            else ""
        )

        result.append({
            "id": conversation.id,
            "title": conversation.title,
            "created_at": conversation.created_at,
            "message_count": message_count,
            "last_message": last_message,
        })

    return result


# -----------------------------
# GET ONE CONVERSATION'S MESSAGES
# -----------------------------
@router.get("/{conversation_id}")
def get_conversation_messages(
    conversation_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    user = get_current_user_from_token(credentials, db)

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found."
        )

    return {
        "id": conversation.id,
        "title": conversation.title,
        "messages": [
            {
                "id": chat.id,
                "question": chat.question,
                "answer": chat.answer,
            }
            for chat in conversation.chats
        ]
    }


# -----------------------------
# DELETE CONVERSATION
# -----------------------------
@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    user = get_current_user_from_token(credentials, db)

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found."
        )

    db.delete(conversation)
    db.commit()

    return {
        "message": "Conversation deleted successfully."
    }
