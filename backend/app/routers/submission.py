"""Submission router — audio upload, transcription, scoring."""

import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import get_current_user
from ..database import get_db
from ..models import Story, Submission, User, WordError
from ..schemas import SubmissionDetail
from ..scoring import score_reading
from ..whisper_service import transcribe_audio

from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/api/submission", tags=["Submissions"])

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "audio")
ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".webm", ".ogg"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

@router.post("", response_model=SubmissionDetail, status_code=status.HTTP_201_CREATED)
async def submit_reading(
    story_id: int = Form(...),
    audio_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload audio, run Whisper, score, and store results."""
    # Validate story exists
    story_result = await db.execute(select(Story).where(Story.id == story_id))
    story = story_result.scalar_one_or_none()
    if story is None:
        raise HTTPException(status_code=404, detail="Story not found")

    # Validate file extension
    ext = os.path.splitext(audio_file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read and size-check
    contents = await audio_file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 25 MB)")

    # Save file
    student_dir = os.path.join(AUDIO_DIR, str(current_user.id))
    os.makedirs(student_dir, exist_ok=True)
    filename = f"{story_id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(student_dir, filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Transcribe
    try:
        transcription = transcribe_audio(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")

    # Score
    result = score_reading(story.story_text, transcription)

    # Save submission
    submission = Submission(
        student_id=current_user.id,
        story_id=story_id,
        audio_file_path=file_path,
        transcription=transcription,
        accuracy_score=result.accuracy,
    )
    db.add(submission)
    await db.flush()

    # Save word errors
    for position, expected, spoken in result.errors:
        db.add(
            WordError(
                submission_id=submission.id,
                expected_word=expected,
                spoken_word=spoken,
                position=position,
            )
        )
    await db.commit()

    # Reload with word errors eagerly loaded
    res = await db.execute(
        select(Submission)
        .options(selectinload(Submission.word_errors))
        .where(Submission.id == submission.id)
    )
    return res.scalar_one()


@router.get("/my", response_model=list[SubmissionDetail])
async def my_submissions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all submissions for the current student."""
    result = await db.execute(
        select(Submission)
        .options(selectinload(Submission.word_errors))
        .where(Submission.student_id == current_user.id)
        .order_by(Submission.created_at.desc())
    )
    return result.scalars().all()
