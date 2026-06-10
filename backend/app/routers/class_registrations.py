from datetime import date
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from typing import Optional

from ..database import get_db
from ..models import ClassRegistration as RegistrationModel, Class as ClassModel, Client as ClientModel, Room as RoomModel
from ..schemas import ApiResponse, ClassRegistrationSchema, ClassRegistrationCreate, ClassRegistrationUpdate
from ..utils.error_handle import handle_error, NotFoundError


router = APIRouter(prefix="/registrations", tags=["registrations"])

@router.get("/", response_model=ApiResponse)
async def get_registrations(
    db: AsyncSession = Depends(get_db),
    client_id: Optional[int] = Query(None),
    class_id: Optional[int] = Query(None)
):
    try:
        query = (
            select(RegistrationModel)
            .options(
                joinedload(RegistrationModel.client),
                joinedload(RegistrationModel.class_info).joinedload(ClassModel.class_type),
                joinedload(RegistrationModel.class_info).joinedload(ClassModel.room).joinedload(RoomModel.gym)
            )
        )

        if client_id is not None:
            query = query.where(RegistrationModel.client_id == client_id)
        if class_id is not None:
            query = query.where(RegistrationModel.class_id == class_id)

        result = await db.execute(query)
        registrations_db = result.scalars().all()

        validated_data = [ClassRegistrationSchema.model_validate(r) for r in registrations_db]

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Registrations retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_registrations")

@router.get("/{class_registration_id}", response_model=ApiResponse)
async def get_registration(class_registration_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = (
            select(RegistrationModel)
            .options(
                joinedload(RegistrationModel.client),
                joinedload(RegistrationModel.class_info).joinedload(ClassModel.class_type),
                joinedload(RegistrationModel.class_info).joinedload(ClassModel.room).joinedload(RoomModel.gym)
            )
        ).where(RegistrationModel.class_registration_id == class_registration_id)

        result = await db.execute(query)
        class_registrations_db = result.scalar_one_or_none()

        if not class_registrations_db:
            raise NotFoundError(resource="Registration", id=class_registration_id)

        return {
            "status": "SUCCEEDED",
            "data": ClassRegistrationSchema.model_validate(class_registrations_db),
            "message": "Registration found"
        }
    except Exception as e:
        return handle_error(e, context="get_registrations")

@router.post("/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_registration(
    payload: ClassRegistrationCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        db_class = await db.get(ClassModel, payload.class_id)
        if not db_class:
            raise NotFoundError(resource="Class")

        if date.today() >= db_class.class_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot register: Registration is only allowed before the class date."
            )

        client = await db.get(ClientModel, payload.client_id)
        if not client:
            raise NotFoundError(resource="Client", id=payload.client_id)

        new_registration = RegistrationModel(**payload.model_dump())
        db.add(new_registration)
        await db.commit()

        query = (
            select(RegistrationModel)
            .options(
                joinedload(RegistrationModel.client),
                joinedload(RegistrationModel.class_info).joinedload(ClassModel.class_type),
                joinedload(RegistrationModel.class_info).joinedload(ClassModel.room).joinedload(RoomModel.gym)
            )
            .where(RegistrationModel.class_registration_id == new_registration.class_registration_id)
        )
        result = await db.execute(query)
        registration_with_relations = result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": ClassRegistrationSchema.model_validate(registration_with_relations),
            "message": "Registration created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_registration")

@router.patch("/{class_registration_id}", response_model=ApiResponse)
async def update_registration(
    class_registration_id: int,
    payload: ClassRegistrationUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        registration = await db.get(RegistrationModel, class_registration_id)

        if not registration:
            raise NotFoundError(resource="Registration", id=class_registration_id)

        update_data = payload.model_dump(exclude_unset=True)

        target_reg_date = update_data.get("registration_date", registration.registration_date)

        if "class_id" in update_data:
            db_class = await db.get(ClassModel, update_data["class_id"])
            if not db_class:
                raise NotFoundError(resource="Class", id=update_data["class_id"])

        else:
            db_class = await db.get(ClassModel, registration.class_id)

        if db_class and target_reg_date >= db_class.class_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update: Registration date cannot be on or after the class date."
            )

        if "client_id" in update_data:
            client = await db.get(ClientModel, update_data["client_id"])
            if not client:
                raise NotFoundError(resource="Client", id=update_data["client_id"])

        for key, value in update_data.items():
            setattr(registration, key, value)

        await db.commit()
        query = (
            select(RegistrationModel)
            .options(
                joinedload(RegistrationModel.client),
                joinedload(RegistrationModel.class_info).joinedload(ClassModel.class_type),
                joinedload(RegistrationModel.class_info).joinedload(ClassModel.room).joinedload(RoomModel.gym)
            )
            .where(RegistrationModel.class_registration_id == class_registration_id)
        )
        result = await db.execute(query)
        registration_with_relations = result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": ClassRegistrationSchema.model_validate(registration_with_relations),
            "message": "Registration updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_class_registration")

@router.delete("/{class_registration_id}", response_model=ApiResponse)
async def delete_registration(class_registration_id: int, db: AsyncSession = Depends(get_db)):
    try:
        registration = await db.get(RegistrationModel, class_registration_id)
        if not registration:
            raise NotFoundError(resource="Registration", id=class_registration_id)

        await db.delete(registration)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Registration deleted successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="delete_registration")