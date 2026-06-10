from datetime import date
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from typing import Optional

from ..database import get_db
from ..models import ClassRegistration as RegistrationModel, Class as ClassModel, Client as ClientModel, Room as RoomModel
from ..schemas import ApiResponse, ClassRegistrationSchema, ClassRegistrationCreate, ClassRegistrationUpdate
from ..utils.error_handle import handle_error, NotFoundError, BadRequestError


router = APIRouter(prefix="/registrations", tags=["registrations"])

@router.get("/", response_model=ApiResponse)
async def get_registrations(
    db: AsyncSession = Depends(get_db),
    client_id: Optional[int] = Query(None, gt=0),
    class_id: Optional[int] = Query(None, gt=0),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
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
        if start_date is not None:
            query = query.where(RegistrationModel.registration_date >= start_date)
        if end_date is not None:
            query = query.where(RegistrationModel.registration_date <= end_date)

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
        if class_registration_id <= 0:
            raise BadRequestError("Invalid registration ID")

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
        # Validate client exists
        client = await db.get(ClientModel, payload.client_id)
        if not client:
            raise BadRequestError(f"Client with id {payload.client_id} does not exist")

        # Validate class exists
        db_class = await db.get(ClassModel, payload.class_id)
        if not db_class:
            raise BadRequestError(f"Class with id {payload.class_id} does not exist")

        # Check if class is full
        count_result = await db.execute(
            select(func.count()).select_from(RegistrationModel)
            .where(RegistrationModel.class_id == payload.class_id)
        )
        current_registrations = count_result.scalar()

        if current_registrations >= db_class.capacity:
            raise BadRequestError(
                f"Cannot register: Class is full. (Capacity: {db_class.capacity})"
            )

        # Validate registration date is not in the future
        if payload.registration_date > date.today():
            raise BadRequestError("Registration date cannot be in the future")

        # Validate registration is before class date
        if payload.registration_date >= db_class.class_date:
            raise BadRequestError(
                f"Registration must be before the class date ({db_class.class_date})"
            )

        # Check for duplicate registration
        duplicate_result = await db.execute(
            select(RegistrationModel)
            .where(RegistrationModel.class_id == payload.class_id)
            .where(RegistrationModel.client_id == payload.client_id)
        )
        if duplicate_result.scalar_one_or_none():
            raise BadRequestError("Client is already registered for this class")

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
        if class_registration_id <= 0:
            raise BadRequestError("Invalid registration ID")

        registration = await db.get(RegistrationModel, class_registration_id)
        if not registration:
            raise NotFoundError(resource="Registration", id=class_registration_id)

        update_data = payload.model_dump(exclude_unset=True)
        if not update_data:
            raise BadRequestError("No fields provided for update")

        target_reg_date = update_data.get("registration_date", registration.registration_date)

        # Validate client if being updated
        if "client_id" in update_data:
            if update_data["client_id"] <= 0:
                raise BadRequestError("Invalid client ID")

            client = await db.get(ClientModel, update_data["client_id"])
            if not client:
                raise BadRequestError(f"Client with id {update_data['client_id']} does not exist")

            # Check for duplicate registration with new client (against target class)
            target_class_id = update_data.get("class_id", registration.class_id)
            duplicate_result = await db.execute(
                select(RegistrationModel)
                .where(RegistrationModel.class_id == target_class_id)
                .where(RegistrationModel.client_id == update_data["client_id"])
                .where(RegistrationModel.class_registration_id != class_registration_id)
            )
            if duplicate_result.scalar_one_or_none():
                raise BadRequestError("This client is already registered for this class")

        # Validate class if being updated
        if "class_id" in update_data:
            if update_data["class_id"] <= 0:
                raise BadRequestError("Invalid class ID")

            db_class = await db.get(ClassModel, update_data["class_id"])
            if not db_class:
                raise BadRequestError(f"Class with id {update_data['class_id']} does not exist")

            # Check capacity if changing to a different class
            if update_data["class_id"] != registration.class_id:
                count_result = await db.execute(
                    select(func.count()).select_from(RegistrationModel)
                    .where(RegistrationModel.class_id == update_data["class_id"])
                )
                current_registrations = count_result.scalar()
                if current_registrations >= db_class.capacity:
                    raise BadRequestError(
                        f"Cannot switch to this class. Class is full. (Capacity: {db_class.capacity})"
                    )

            if "client_id" not in update_data:
                duplicate_result = await db.execute(
                    select(RegistrationModel)
                    .where(RegistrationModel.class_id == update_data["class_id"])
                    .where(RegistrationModel.client_id == registration.client_id)
                    .where(RegistrationModel.class_registration_id != class_registration_id)
                )
                if duplicate_result.scalar_one_or_none():
                    raise BadRequestError("This client is already registered for this class")
        else:
            db_class = await db.get(ClassModel, registration.class_id)

        # Validate registration date
        if "registration_date" in update_data:
            if update_data["registration_date"] > date.today():
                raise BadRequestError("Registration date cannot be in the future")

        if target_reg_date >= db_class.class_date:
            raise BadRequestError(
                f"Registration date must be before the class date ({db_class.class_date})"
            )

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
        # Validate registration ID
        if class_registration_id <= 0:
            raise BadRequestError("Invalid registration ID")

        # Check if registration exists
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