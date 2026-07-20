from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.services.gemini import ask_gemini
from app.vectorstore.faiss_store import load_vector_store

from app.database.database import get_db
from app.database.models import Chat, Conversation, User
from app.utils.auth import get_current_user

router = APIRouter()

# Number of previous exchanges to include as conversation memory
HISTORY_LIMIT = 6

# How many characters of the first message to use as the auto-title
TITLE_LENGTH = 50


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None


def make_title(message: str) -> str:
    cleaned = message.strip()

    if len(cleaned) <= TITLE_LENGTH:
        return cleaned

    return cleaned[:TITLE_LENGTH].rstrip() + "..."


@router.post("/chat")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # ----------------------------------------------------
    # Find or create the conversation this message belongs to
    # ----------------------------------------------------
    conversation = None

    if request.conversation_id:
        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == request.conversation_id,
                Conversation.user_id == current_user.id
            )
            .first()
        )

    if conversation is None:
        conversation = Conversation(
            title=make_title(request.message),
            user_id=current_user.id
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # ----------------------------------------------------
    # Load recent conversation history (within this conversation only)
    # ----------------------------------------------------
    recent_chats = (
        db.query(Chat)
        .filter(Chat.conversation_id == conversation.id)
        .order_by(Chat.created_at.desc())
        .limit(HISTORY_LIMIT)
        .all()
    )

    recent_chats.reverse()

    conversation_history = ""

    for past in recent_chats:
        conversation_history += f"Student: {past.question}\n"
        conversation_history += f"AI Mentor: {past.answer}\n\n"

    # ----------------------------------------------------
    # Load this user's vector store
    # ----------------------------------------------------
    vector_store = load_vector_store(current_user.id)

    if vector_store is None:

        reply = "❌ No study notes found. Please upload a PDF first."

        db.add(
            Chat(
                question=request.message,
                answer=reply,
                user_id=current_user.id,
                conversation_id=conversation.id
            )
        )

        db.commit()

        return {
            "reply": reply,
            "conversation_id": conversation.id
        }

    docs = vector_store.similarity_search(
        request.message,
        k=3
    )

    if len(docs) == 0:

        reply = "This information is not available in the uploaded notes."

        db.add(
            Chat(
                question=request.message,
                answer=reply,
                user_id=current_user.id,
                conversation_id=conversation.id
            )
        )

        db.commit()

        return {
            "reply": reply,
            "conversation_id": conversation.id
        }

    context = ""

    for doc in docs:
        context += doc.page_content + "\n\n"

    prompt = f"""
You are an AI Mentor.

Use ONLY the study notes below to answer.

If the answer is not available inside the notes, clearly say:

"This information is not available in the uploaded notes."

========================
CONVERSATION SO FAR
========================

{conversation_history if conversation_history else "(No previous messages yet)"}

========================
STUDY NOTES
========================

{context}

========================
CURRENT QUESTION
========================

{request.message}

Instructions:
- If the current question refers back to something in the conversation above
  (e.g. "explain the second point again", "what did you mean by that"),
  use the conversation history to understand what is being asked.
- Still only answer using facts from the study notes above.
- Give a clean answer using Markdown.
- Use proper headings, bullet points and code blocks whenever appropriate.
"""

    answer = ask_gemini(prompt)

    db.add(
        Chat(
            question=request.message,
            answer=answer,
            user_id=current_user.id,
            conversation_id=conversation.id
        )
    )

    db.commit()

    return {
        "reply": answer,
        "conversation_id": conversation.id
    }
