from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import Optional
from pydantic import BaseModel

from ..database import get_db
from ..models import (
    Client as ClientModel,
    ClassRegistration as ClassRegistrationModel,
    ClientSubscription as ClientSubscriptionModel,
    Entry as EntryModel,
    PersonalTraining as PersonalTrainingModel,
    TransactionClient as TransactionClientModel
)
from ..schemas import ApiResponse, ClientSchema, ClientCreate, ClientUpdate
from ..utils.error_handle import handle_error, NotFoundError, BadRequestError

router = APIRouter(
    prefix="/clients",
    tags=["clients"]
)

@router.get("/", response_model=ApiResponse)
async def get_clients(
    db: AsyncSession = Depends(get_db),
    name: Optional[str] = Query(None, min_length=1, max_length=32),
    surname: Optional[str] = Query(None, min_length=1, max_length=64),
    email: Optional[str] = Query(None)
):
    try:
        query = select(ClientModel).order_by(ClientModel.client_id.desc())

        if name:
            query = query.where(ClientModel.name.ilike(f"%{name}%"))
        if surname:
            query = query.where(ClientModel.surname.ilike(f"%{surname}%"))
        if email:
            query = query.where(ClientModel.email.ilike(f"%{email}%"))

        result = await db.execute(query)
        clients_db = result.scalars().all()

        validated_data = [ClientSchema.model_validate(c) for c in clients_db]

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Clients retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_clients")

@router.get("/{client_id}", response_model=ApiResponse)
async def get_client(client_id: int, db: AsyncSession = Depends(get_db)):
    try:
        if client_id <= 0:
            raise BadRequestError("Invalid client ID")

        db_client = await db.get(ClientModel, client_id)
        if not db_client:
            raise NotFoundError(resource="Client", id=client_id)

        return {
            "status": "SUCCEEDED",
            "data": ClientSchema.model_validate(db_client),
            "message": "Client found"
        }
    except Exception as e:
        return handle_error(e, context="get_client")

@router.post("/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    payload: ClientCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        if not payload.name or not payload.name.strip():
            raise BadRequestError("Client name is required")
        if not payload.surname or not payload.surname.strip():
            raise BadRequestError("Client surname is required")
        if not payload.email or not payload.email.strip():
            raise BadRequestError("Client email is required")
        if not payload.phone or not payload.phone.strip():
            raise BadRequestError("Client phone is required")

        # Check for duplicate email
        existing = await db.execute(
            select(ClientModel).where(ClientModel.email == payload.email.strip())
        )
        if existing.scalar_one_or_none():
            raise BadRequestError("Client with this email already exists")

        # Manual ID generation since the database lacks a sequence
        result = await db.execute(select(ClientModel.client_id).order_by(ClientModel.client_id.desc()).limit(1))
        max_id = result.scalar_one_or_none() or 0
        new_id = max_id + 1

        new_client = ClientModel(client_id=new_id, **payload.model_dump())
        db.add(new_client)
        await db.commit()
        await db.refresh(new_client)

        return {
            "status": "SUCCEEDED",
            "data": ClientSchema.model_validate(new_client),
            "message": "Client created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_client")

@router.patch("/{client_id}", response_model=ApiResponse)
async def update_client(
    client_id: int,
    payload: ClientUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        if client_id <= 0:
            raise BadRequestError("Invalid client ID")

        db_client = await db.get(ClientModel, client_id)
        if not db_client:
            raise NotFoundError(resource="Client", id=client_id)

        update_data = payload.model_dump(exclude_unset=True)
        if not update_data:
            raise BadRequestError("No fields provided for update")

        if "email" in update_data:
            # Check for duplicate email
            existing = await db.execute(
                select(ClientModel)
                .where(ClientModel.email == update_data["email"].strip())
                .where(ClientModel.client_id != client_id)
            )
            if existing.scalar_one_or_none():
                raise BadRequestError("Another client with this email already exists")

        for key, value in update_data.items():
            setattr(db_client, key, value)

        await db.commit()
        await db.refresh(db_client)

        return {
            "status": "SUCCEEDED",
            "data": ClientSchema.model_validate(db_client),
            "message": "Client updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_client")

@router.delete("/{client_id}", response_model=ApiResponse)
async def delete_client(client_id: int, db: AsyncSession = Depends(get_db)):
    try:
        if client_id <= 0:
            raise BadRequestError("Invalid client ID")

        db_client = await db.get(ClientModel, client_id)
        if not db_client:
            raise NotFoundError(resource="Client", id=client_id)

        # Check usages
        checks = [
            (ClassRegistrationModel, ClassRegistrationModel.client_id, "class registrations"),
            (ClientSubscriptionModel, ClientSubscriptionModel.client_id, "subscriptions"),
            (EntryModel, EntryModel.client_id, "entries"),
            (PersonalTrainingModel, PersonalTrainingModel.client_id, "personal trainings"),
            (TransactionClientModel, TransactionClientModel.client_id, "transactions")
        ]

        for model, field, desc in checks:
            usage = await db.execute(select(model).where(field == client_id).limit(1))
            if usage.scalars().first():
                raise BadRequestError(f"Cannot delete client '{db_client.name} {db_client.surname}' because they have associated {desc}.")

        await db.delete(db_client)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Client deleted successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="delete_client")

@router.get("/{client_id}/total_spent", response_model=ApiResponse)
async def get_client_total_spent(client_id: int, db: AsyncSession = Depends(get_db)):
    try:
        if client_id <= 0:
            raise BadRequestError("Invalid client ID")

        db_client = await db.get(ClientModel, client_id)
        if not db_client:
            raise NotFoundError(resource="Client", id=client_id)

        result = await db.execute(
            text("SELECT get_client_total_spent(:client_id)"), 
            {"client_id": client_id}
        )
        total = result.scalar()
        
        return {
            "status": "SUCCEEDED",
            "data": float(total) if total else 0.0,
            "message": "Total spent retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_client_total_spent")
