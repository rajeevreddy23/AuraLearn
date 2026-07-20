from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..core.security import verify_firebase_token
from ..models.database_models import User, StudySession, Notification
import uuid

router = APIRouter()

@router.get("/me")
async def get_me(user=Depends(verify_firebase_token), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user["uid"]))
    db_user = result.scalar_one_or_none()
    if not db_user:
        db_user = User(
            id=user["uid"],
            email=user.get("email", ""),
            display_name=user.get("name", ""),
            photo_url=user.get("picture", ""),
            email_verified=user.get("email_verified", False),
        )
        db.add(db_user)
        await db.commit()
    return {"success": True, "data": db_user}

@router.put("/me")
async def update_me(
    data: dict, user=Depends(verify_firebase_token), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user["uid"]))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    allowed_keys = {"display_name", "photo_url", "phone_number", "settings", "learning_preferences"}
    for key, value in data.items():
        if key in allowed_keys and hasattr(db_user, key):
            setattr(db_user, key, value)
    await db.commit()
    return {"success": True, "data": db_user}

@router.post("/study-session")
async def log_study_session(
    data: dict, user=Depends(verify_firebase_token), db: AsyncSession = Depends(get_db)
):
    session = StudySession(
        id=str(uuid.uuid4()),
        user_id=user["uid"],
        course_id=data.get("course_id"),
        duration_minutes=data.get("duration", 0),
        type=data.get("type", "study"),
    )
    db.add(session)
    await db.commit()
    return {"success": True, "data": session}

@router.get("/notifications")
async def get_notifications(
    user=Depends(verify_firebase_token), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user["uid"])
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    notifications = result.scalars().all()
    return {"success": True, "data": notifications}

@router.post("/notifications/read")
async def mark_notification_read(
    data: dict, user=Depends(verify_firebase_token), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == data.get("notification_id"),
            Notification.user_id == user["uid"]
        )
    )
    notif = result.scalar_one_or_none()
    if notif:
        notif.is_read = True
        await db.commit()
    return {"success": True}
