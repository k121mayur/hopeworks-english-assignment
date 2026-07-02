"""Reports router — attendance, progress, difficult words, dashboard."""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import require_admin
from ..database import get_db
from ..models import Class, ClassStudent, Story, Submission, User, WordError
from ..schemas import (
    AttendanceRecord,
    DashboardMetrics,
    DifficultWord,
    ProgressRecord,
)

router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
    dependencies=[Depends(require_admin)],
)


@router.get("/attendance", response_model=list[AttendanceRecord])
async def attendance_report(
    class_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Daily attendance — which students submitted readings."""
    # Build student query
    student_q = select(User).where(User.role == "student")
    if class_id:
        student_q = student_q.join(ClassStudent).where(ClassStudent.class_id == class_id)
    student_result = await db.execute(student_q)
    students = student_result.scalars().all()

    # Build story query
    story_q = select(Story)
    if start_date:
        story_q = story_q.where(Story.created_date >= start_date)
    if end_date:
        story_q = story_q.where(Story.created_date <= end_date)
    story_q = story_q.order_by(Story.created_date.desc())
    story_result = await db.execute(story_q)
    stories = story_result.scalars().all()

    # Find all submissions as a set for fast lookup
    sub_result = await db.execute(
        select(Submission.student_id, Submission.story_id)
    )
    submitted_set = {(row[0], row[1]) for row in sub_result.all()}

    records = []
    for story in stories:
        for student in students:
            records.append(
                AttendanceRecord(
                    student_name=student.name,
                    student_email=student.email,
                    date=story.created_date,
                    story_id=story.id,
                    story_title=story.title,
                    submitted=(student.id, story.id) in submitted_set,
                )
            )
    return records


@router.get("/progress/{student_id}", response_model=list[ProgressRecord])
async def student_progress(student_id: str, db: AsyncSession = Depends(get_db)):
    """Accuracy scores over time for one student."""
    result = await db.execute(
        select(Submission, Story)
        .join(Story, Submission.story_id == Story.id)
        .where(Submission.student_id == student_id)
        .order_by(Submission.created_at)
    )
    rows = result.all()
    return [
        ProgressRecord(
            date=sub.created_at.date(),
            story_title=story.title,
            accuracy_score=sub.accuracy_score or 0,
        )
        for sub, story in rows
    ]


@router.get("/difficult-words", response_model=list[DifficultWord])
async def difficult_words(
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Most-mispronounced words across the platform."""
    result = await db.execute(
        select(
            WordError.expected_word,
            func.count().label("error_count"),
        )
        .where(WordError.expected_word != "")
        .group_by(WordError.expected_word)
        .order_by(func.count().desc())
        .limit(limit)
    )
    return [
        DifficultWord(word=row[0], error_count=row[1]) for row in result.all()
    ]


@router.get("/dashboard", response_model=DashboardMetrics)
async def dashboard_metrics(db: AsyncSession = Depends(get_db)):
    """Aggregate metrics for the admin dashboard."""
    avg_acc = await db.execute(select(func.avg(Submission.accuracy_score)))
    total_subs = await db.execute(select(func.count()).select_from(Submission))
    total_students = await db.execute(
        select(func.count()).select_from(User).where(User.role == "student")
    )
    total_stories = await db.execute(select(func.count()).select_from(Story))

    return DashboardMetrics(
        average_accuracy=round(avg_acc.scalar() or 0, 2),
        total_submissions=total_subs.scalar() or 0,
        total_students=total_students.scalar() or 0,
        total_stories=total_stories.scalar() or 0,
    )
