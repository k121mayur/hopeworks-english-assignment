"""SQLAlchemy ORM models."""

import uuid
from datetime import datetime, date

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False, default="")
    role = Column(String(20), nullable=False, default="student")  # admin / student
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    submissions = relationship("Submission", back_populates="student")
    class_memberships = relationship("ClassStudent", back_populates="student")


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    class_name = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    students = relationship("ClassStudent", back_populates="class_")


class ClassStudent(Base):
    __tablename__ = "class_students"

    id = Column(Integer, primary_key=True, autoincrement=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    class_ = relationship("Class", back_populates="students")
    student = relationship("User", back_populates="class_memberships")


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(500), nullable=False)
    story_text = Column(Text, nullable=False)
    word_count = Column(Integer, nullable=False)
    created_date = Column(Date, nullable=False, default=date.today, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("Submission", back_populates="story")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    story_id = Column(Integer, ForeignKey("stories.id", ondelete="CASCADE"), nullable=False)
    audio_file_path = Column(String(500), nullable=False)
    transcription = Column(Text, nullable=True)
    accuracy_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="submissions")
    story = relationship("Story", back_populates="submissions")
    word_errors = relationship("WordError", back_populates="submission", cascade="all, delete-orphan")


class WordError(Base):
    __tablename__ = "word_errors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    submission_id = Column(
        Integer, ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False
    )
    expected_word = Column(String(255), nullable=False)
    spoken_word = Column(String(255), nullable=False)
    position = Column(Integer, nullable=False)

    submission = relationship("Submission", back_populates="word_errors")
