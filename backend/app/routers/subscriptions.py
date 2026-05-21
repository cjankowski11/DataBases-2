from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from ..database import get_db
from ..models import Subscription as SubscriptionModel, ClientSubscription as ClientSubscriptionModel
from ..schemas import SubscriptionSchema, ClientSubscriptionSchema, ApiResponse
from ..utils.error_handle import handle_error, NotFoundError


router = APIRouter(
    prefix="/subscriptions",
    tags=["subscriptions"]
)

@router.get("/", response_model=ApiResponse)
async def get_subscriptions(db: AsyncSession = Depends(get_db)):
    try:
        query = select(SubscriptionModel)
        result = await db.execute(query)
        subscriptions = result.scalars().all()

        validated_data = [SubscriptionSchema.model_validate(s) for s in subscriptions]

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Subscriptions retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_subscriptions")

@router.get("/client-subscriptions", response_model=ApiResponse)
async def get_client_subscriptions(db: AsyncSession = Depends(get_db)):
    try:
        query = select(ClientSubscriptionModel).options(
            joinedload(ClientSubscriptionModel.client),
            joinedload(ClientSubscriptionModel.subscription)
        )
        result = await db.execute(query)
        client_subs = result.scalars().all()

        validated_data = [ClientSubscriptionSchema.model_validate(cs) for cs in client_subs]

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Client subscriptions retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_client_subscriptions")

@router.get("/{subscription_id}", response_model=ApiResponse)
async def get_subscription(subscription_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = select(SubscriptionModel).where(SubscriptionModel.subscription_id == subscription_id)
        result = await db.execute(query)
        sub_db = result.scalar_one_or_none()

        if not sub_db:
            raise NotFoundError(resource="Subscription", id=subscription_id)

        return {
            "status": "SUCCEEDED",
            "data": SubscriptionSchema.model_validate(sub_db),
            "message": "Subscription found"
        }
    except Exception as e:
        return handle_error(e, context="get_subscription")
