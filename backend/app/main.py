"""FastAPI application entry point."""

import os
import logging

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from .auth import hash_password
from .database import Base, engine, async_session
from .models import User
from .routers import admin, auth, reports, story, submission

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Student Reading Assessment System",
    description="Audio reading practice and automated accuracy scoring",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(story.router)
app.include_router(admin.router)
app.include_router(submission.router)
app.include_router(reports.router)


@app.on_event("startup")
async def on_startup():
    """Create tables and bootstrap admin user."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created / verified.")

    # Bootstrap admin from env
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if admin_email and admin_password:
        async with async_session() as session:
            result = await session.execute(
                select(User).where(User.email == admin_email)
            )
            if result.scalar_one_or_none() is None:
                admin_user = User(
                    email=admin_email,
                    password_hash=hash_password(admin_password),
                    name="Admin",
                    role="admin",
                )
                session.add(admin_user)
                await session.commit()
                logger.info("Admin user created: %s", admin_email)
            else:
                logger.info("Admin user already exists.")


@app.get("/")
async def root():
    return {"message": "Student Reading Assessment System API", "docs": "/docs"}
