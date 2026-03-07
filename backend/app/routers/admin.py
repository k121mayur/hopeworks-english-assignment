"""Admin router — class/student management."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import hash_password, require_admin
from ..database import get_db
from ..models import Class, ClassStudent, User
from ..schemas import ClassAssign, ClassCreate, ClassOut, StudentCreate, UserOut

router = APIRouter(prefix="/api/admin", tags=["Admin"], dependencies=[Depends(require_admin)])


# ── Classes ──────────────────────────────────────────────────────────────────


@router.post("/classes", response_model=ClassOut, status_code=status.HTTP_201_CREATED)
async def create_class(body: ClassCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(Class).where(Class.class_name == body.class_name)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Class name already exists")

    cls = Class(class_name=body.class_name)
    db.add(cls)
    await db.flush()
    await db.refresh(cls)
    return cls


@router.get("/classes", response_model=list[ClassOut])
async def list_classes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Class).order_by(Class.class_name))
    return result.scalars().all()


# ── Students ─────────────────────────────────────────────────────────────────


@router.post("/students", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_student(body: StudentCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        name=body.name,
        role="student",
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@router.get("/students", response_model=list[UserOut])
async def list_students(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.role == "student").order_by(User.name)
    )
    return result.scalars().all()


# ── Assign ───────────────────────────────────────────────────────────────────


@router.post("/class/assign", status_code=status.HTTP_201_CREATED)
async def assign_student(body: ClassAssign, db: AsyncSession = Depends(get_db)):
    # Verify class exists
    cls = await db.execute(select(Class).where(Class.id == body.class_id))
    if cls.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Class not found")

    # Verify student exists
    student = await db.execute(select(User).where(User.id == body.student_id, User.role == "student"))
    if student.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check duplicate
    dup = await db.execute(
        select(ClassStudent).where(
            ClassStudent.class_id == body.class_id,
            ClassStudent.student_id == body.student_id,
        )
    )
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Student already assigned to this class")

    link = ClassStudent(class_id=body.class_id, student_id=body.student_id)
    db.add(link)
    await db.flush()
    return {"detail": "Student assigned to class"}
