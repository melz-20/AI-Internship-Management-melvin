from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    Boolean,
    DateTime
)
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True)
    email = Column(String, unique=True)
    password = Column(String)

    theme = Column(
        String,
        default="Light"
    )

    notifications = Column(
        Boolean,
        default=True
    )

    # Stored filename of the user's uploaded avatar, if any
    profile_picture = Column(
        String,
        nullable=True
    )

    chats = relationship(
        "Chat",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    conversations = relationship(
        "Conversation",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    uploads = relationship(
        "Upload",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)

    # Auto-generated from the first message in the conversation
    title = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    user = relationship(
        "User",
        back_populates="conversations"
    )

    chats = relationship(
        "Chat",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Chat.created_at"
    )


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)

    question = Column(Text)
    answer = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id")
    )

    user = relationship(
        "User",
        back_populates="chats"
    )

    conversation = relationship(
        "Conversation",
        back_populates="chats"
    )


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)

    # Original filename shown to the user
    filename = Column(String)

    # Unique filename stored on disk
    stored_filename = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    user = relationship(
        "User",
        back_populates="uploads"
    )
