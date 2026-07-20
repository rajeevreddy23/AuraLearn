from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..core.security import verify_firebase_token
from ..core.config import settings
from ..models.database_models import User
import stripe

router = APIRouter()

stripe.api_key = settings.stripe_secret_key

@router.post("/create-checkout-session")
async def create_checkout_session(
    data: dict, user=Depends(verify_firebase_token)
):
    if not stripe.api_key:
        raise HTTPException(status_code=400, detail="Stripe not configured")
    try:
        price_id = data.get("price_id", settings.stripe_price_monthly)
        session = stripe.checkout.Session.create(
            customer_email=user.get("email"),
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=f"{settings.backend_cors_origins[0]}/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.backend_cors_origins[0]}/pricing",
            metadata={"firebase_uid": user["uid"]},
        )
        return {"success": True, "url": session.url, "session_id": session.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-portal-session")
async def create_portal_session(
    data: dict, user=Depends(verify_firebase_token)
):
    if not stripe.api_key:
        raise HTTPException(status_code=400, detail="Stripe not configured")
    try:
        session = stripe.billing_portal.Session.create(
            customer=data.get("stripe_customer_id"),
            return_url=f"{settings.backend_cors_origins[0]}/settings",
        )
        return {"success": True, "url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    if not settings.stripe_webhook_secret:
        return {"received": True}
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        firebase_uid = session.get("metadata", {}).get("firebase_uid")
        if firebase_uid:
            result = await db.execute(select(User).where(User.id == firebase_uid))
            db_user = result.scalar_one_or_none()
            if db_user:
                db_user.subscription = {
                    "plan": "premium",
                    "status": "active",
                    "customerId": session.get("customer"),
                    "subscriptionId": session.get("subscription"),
                    "features": ["basic_courses", "premium_courses", "ai_teacher"],
                }
                await db.commit()
    return {"received": True}
