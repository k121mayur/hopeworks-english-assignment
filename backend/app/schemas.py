"""Pydantic request / response schemas."""

from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────────────


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


# ── User / Student ───────────────────────────────────────────────────────────


class StudentCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserOut(BaseModel):
    id: UUID
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Class ─────────────────────────────────────────────────────────────────────


class ClassCreate(BaseModel):
    class_name: str


class ClassOut(BaseModel):
    id: int
    class_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class ClassAssign(BaseModel):
    class_id: int
    student_id: UUID


# ── Story ─────────────────────────────────────────────────────────────────────


class StoryCreate(BaseModel):
    title: str
    story_text: str


class StoryOut(BaseModel):
    id: int
    title: str
    story_text: str
    word_count: int
    created_date: date
    created_at: datetime

    class Config:
        from_attributes = True


# ── Submission ────────────────────────────────────────────────────────────────


class SubmissionOut(BaseModel):
    id: int
    student_id: UUID
    story_id: int
    audio_file_path: str
    transcription: Optional[str]
    accuracy_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class WordErrorOut(BaseModel):
    expected_word: str
    spoken_word: str
    position: int

    class Config:
        from_attributes = True


class SubmissionDetail(SubmissionOut):
    word_errors: List[WordErrorOut] = []


# ── Reports ───────────────────────────────────────────────────────────────────


class AttendanceRecord(BaseModel):
    student_name: str
    student_email: str
    date: date
    story_id: int
    story_title: str
    submitted: bool


class ProgressRecord(BaseModel):
    date: date
    story_title: str
    accuracy_score: float


class DifficultWord(BaseModel):
    word: str
    error_count: int


class DashboardMetrics(BaseModel):
    average_accuracy: float
    total_submissions: int
    total_students: int
    total_stories: int
