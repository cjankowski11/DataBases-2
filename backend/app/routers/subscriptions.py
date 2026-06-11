from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError

from ..database import get_db
from ..models import Subscription as SubscriptionModel, ClientSubscription as ClientSubscriptionModel
from ..schemas import SubscriptionSchema, ClientSubscriptionSchema,SubscriptionCreate,ClientSubscriptionCreate, SubscriptionUpdate, ClientSubscriptionUpdate, ApiResponse
from ..utils.error_handle import handle_error, NotFoundError, BadRequestError


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

@router.get("/client-subscriptions/{client_subscription_id}", response_model=ApiResponse)
async def get_client_subscription(client_subscription_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = (
            select(ClientSubscriptionModel)
            .options(
                joinedload(ClientSubscriptionModel.client),
                joinedload(ClientSubscriptionModel.subscription)
            )
            .where(ClientSubscriptionModel.client_subscription_id == client_subscription_id)
        )
        result = await db.execute(query)
        client_sub = result.scalar_one_or_none()

        if not client_sub:
            raise NotFoundError(resource="Client Subscription", id=client_subscription_id)

        return {
            "status": "SUCCEEDED",
            "data": ClientSubscriptionSchema.model_validate(client_sub),
            "message": "Client subscription found"
        }
    except Exception as e:
        return handle_error(e, context="get_client_subscription")

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

@router.post("/",response_model=ApiResponse,status_code=201)
async def create_subscription(
    payload: SubscriptionCreate,
    db: AsyncSession = Depends(get_db)
    ):
        try:
            new_sub = SubscriptionModel(**payload.model_dump())
            db.add(new_sub)
            await db.commit()
            await db.refresh(new_sub)
            return {
                "status":"SUCCEEDED",
                "data": SubscriptionSchema.model_validate(new_sub),
                "message": "Subscription created successfully"
            }
        except Exception as e:
            return handle_error(e, context="create_subscription")

@router.patch("/{subscription_id}", response_model=ApiResponse)
async def update_subscription(
    subscription_id: int,
    payload: SubscriptionUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        db_sub = await db.get(SubscriptionModel, subscription_id)

        if not db_sub:
            raise NotFoundError(resource="Subscription", id=subscription_id)

        update_data = payload.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(db_sub, key, value)

        await db.commit()
        await db.refresh(db_sub)

        return {
            "status": "SUCCEEDED",
            "data": SubscriptionSchema.model_validate(db_sub),
            "message": "Subscription updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_subscription")

@router.post("/client-subscriptions", response_model=ApiResponse, status_code=201)
async def create_client_subscription(
    payload: ClientSubscriptionCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        sub = await db.get(SubscriptionModel, payload.subscription_id)
        if not sub:
            raise NotFoundError(resource="Subscription", id=payload.subscription_id)

        data = payload.model_dump()
        employee_id_value = data.pop('receptionist_employee_id', None)

        new_client_sub = ClientSubscriptionModel(
            **data,
            employee_id=employee_id_value
        )

        db.add(new_client_sub)
        await db.commit()
        await db.refresh(new_client_sub)

        query = (
            select(ClientSubscriptionModel)
            .options(
                joinedload(ClientSubscriptionModel.client),
                joinedload(ClientSubscriptionModel.subscription)
            )
            .where(ClientSubscriptionModel.client_subscription_id == new_client_sub.client_subscription_id)
        )
        result = await db.execute(query)
        full = result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": ClientSubscriptionSchema.model_validate(full),
            "message": "Client subscription created successfully"
        }
    except Exception as e:
        return handle_error(e, context="create_client_subscription")

@router.patch("/client-subscriptions/{client_subscription_id}", response_model=ApiResponse)
async def update_client_subscription(
    client_subscription_id: int,
    payload: ClientSubscriptionUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        db_client_sub = await db.get(ClientSubscriptionModel, client_subscription_id)

        if not db_client_sub:
            raise NotFoundError(resource="Client Subscription", id=client_subscription_id)

        update_data = payload.model_dump(exclude_unset=True)

        if "subscription_id" in update_data and update_data["subscription_id"] is not None:
            sub = await db.get(SubscriptionModel, update_data["subscription_id"])
            if not sub:
                raise NotFoundError(resource="Subscription", id=update_data["subscription_id"])

        if "receptionist_employee_id" in update_data:
            employee_id_value = update_data.pop("receptionist_employee_id")
            update_data["employee_id"] = employee_id_value

        for key, value in update_data.items():
            setattr(db_client_sub, key, value)

        await db.commit()
        await db.refresh(db_client_sub)

        query = (
            select(ClientSubscriptionModel)
            .options(
                joinedload(ClientSubscriptionModel.client),
                joinedload(ClientSubscriptionModel.subscription)
            )
            .where(ClientSubscriptionModel.client_subscription_id == db_client_sub.client_subscription_id)
        )
        result = await db.execute(query)
        full = result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": ClientSubscriptionSchema.model_validate(full),
            "message": "Client subscription updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_client_subscription")

@router.delete("/{subscription_id}", response_model=ApiResponse)
async def delete_subscription(subscription_id: int, db: AsyncSession = Depends(get_db)):
    try:
        sub_db = await db.get(SubscriptionModel, subscription_id)
        if not sub_db:
            raise NotFoundError(resource="Subscription", id=subscription_id)

        try:
            await db.delete(sub_db)
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise BadRequestError("Cannot delete this subscription because it is currently in use by clients.")

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Subscription deleted successfully"
        }
    except Exception as e:
        return handle_error(e, context="delete_subscription")

@router.delete("/client-subscriptions/{client_subscription_id}", response_model=ApiResponse)
async def delete_client_subscription(client_subscription_id: int, db: AsyncSession = Depends(get_db)):
    try:
        client_sub = await db.get(ClientSubscriptionModel, client_subscription_id)
        if not client_sub:
            raise NotFoundError(resource="Client Subscription", id=client_subscription_id)

        await db.delete(client_sub)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Client subscription deleted successfully"
        }
    except Exception as e:
        return handle_error(e, context="delete_client_subscription")
