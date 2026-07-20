from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..core.security import verify_firebase_token
from ..models.database_models import Course, Enrollment, Certificate
from ..agents.curriculum_agent import CurriculumAgent
from ..agents.teacher_agent import TeacherAgent
import uuid, json

router = APIRouter()
curriculum = CurriculumAgent()
teacher = TeacherAgent()

@router.get("/")
async def list_courses(
    category: str = None, level: str = None, search: str = None,
    page: int = 1, limit: int = 20, db: AsyncSession = Depends(get_db)
):
    query = select(Course).where(Course.is_published == True)
    if category:
        query = query.where(Course.category == category)
    if level:
        query = query.where(Course.level == level)
    if search:
        query = query.where(Course.title.ilike(f"%{search}%"))
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    courses = result.scalars().all()
    return {"success": True, "data": courses, "page": page, "limit": limit}

@router.get("/{course_id}")
async def get_course(course_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"success": True, "data": course}

@router.post("/ai-generate")
async def ai_generate_course(
    data: dict, user=Depends(verify_firebase_token), db: AsyncSession = Depends(get_db)
):
    topic = data.get("topic")
    level = data.get("level", "beginner")
    if not topic:
        raise HTTPException(status_code=400, detail="Topic required")
    course_data = await curriculum.generate_course(topic, level)
    course = Course(
        id=str(uuid.uuid4()),
        title=course_data.get("title", topic),
        description=course_data.get("description", ""),
        category=data.get("category", "other"),
        level=level,
        instructor_id=user["uid"],
        modules=course_data.get("modules", []),
        total_lessons=sum(len(m.get("lessons", [])) for m in course_data.get("modules", [])),
        learning_outcomes=course_data.get("learning_outcomes", []),
        is_published=True,
        tags=[topic],
    )
    db.add(course)
    await db.commit()
    return {"success": True, "data": course}

@router.post("/{course_id}/enroll")
async def enroll_course(
    course_id: str, user=Depends(verify_firebase_token), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    existing = await db.execute(
        select(Enrollment).where(
            Enrollment.user_id == user["uid"],
            Enrollment.course_id == course_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already enrolled")
    enrollment = Enrollment(
        id=str(uuid.uuid4()),
        user_id=user["uid"],
        course_id=course_id,
        completed_lessons=[],
    )
    course.enrolled_count = (course.enrolled_count or 0) + 1
    db.add(enrollment)
    await db.commit()
    return {"success": True, "data": enrollment}

@router.get("/{course_id}/progress")
async def get_progress(
    course_id: str, user=Depends(verify_firebase_token), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Enrollment).where(
            Enrollment.user_id == user["uid"],
            Enrollment.course_id == course_id
        )
    )
    enrollment = result.scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled")
    return {"success": True, "data": enrollment}
