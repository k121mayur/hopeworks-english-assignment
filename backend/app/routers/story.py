"""Story router — n8n integration and today's story."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Story
from ..schemas import StoryCreate, StoryOut

router = APIRouter(prefix="/api/story", tags=["Stories"])


@router.post("", response_model=StoryOut, status_code=status.HTTP_201_CREATED)
async def create_story(body: StoryCreate, db: AsyncSession = Depends(get_db)):
    """Receive a new story from n8n.  One story per day is enforced."""
    today = date.today()

    existing = await db.execute(
        select(func.count()).select_from(Story).where(Story.created_date == today)
    )
    if existing.scalar() > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A story has already been created for today",
        )

    word_count = len(body.story_text.split())
    story = Story(
        title=body.title,
        story_text=body.story_text,
        word_count=word_count,
        created_date=today,
    )
    db.add(story)
    await db.flush()
    await db.refresh(story)
    return story


@router.get("/today", response_model=StoryOut)
async def get_today_story(db: AsyncSession = Depends(get_db)):
    """Return today's story."""
    today = date.today()
    result = await db.execute(select(Story).where(Story.created_date == today))
    story = result.scalar_one_or_none()

    if story is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No story available for today",
        )
    return story


@router.get("", response_model=list[StoryOut])
async def list_stories(db: AsyncSession = Depends(get_db)):
    """List all stories (newest first)."""
    result = await db.execute(select(Story).order_by(Story.created_date.desc()))
    return result.scalars().all()
