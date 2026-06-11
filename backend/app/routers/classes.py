from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import joinedload
from typing import Optional
from datetime import date


from ..database import get_db
from ..models import Class as ClassModel, Room as RoomModel, ClassType as ClassTypeModel, ClassRegistration as RegistrationModel
from ..schemas import ApiResponse, ClassSchema, ClassCreate, ClassUpdate
from ..utils.error_handle import handle_error, NotFoundError, BadRequestError

router = APIRouter(
    prefix="/classes",
    tags=["classes"]
)

@router.get("/", response_model=ApiResponse)
async def get_classes(
    db: AsyncSession = Depends(get_db),
    room_id: Optional[int] = Query(None, gt=0),
    class_type_id: Optional[int] = Query(None, gt=0),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None)
):
    try:
        query = (
            select(ClassModel)
            .options(
                joinedload(ClassModel.class_type),
                joinedload(ClassModel.room).joinedload(RoomModel.gym)
            )
        )

        filters = []
        if room_id:
            filters.append(ClassModel.room_id == room_id)
        if class_type_id:
            filters.append(ClassModel.class_type_id == class_type_id)
        if from_date:
            filters.append(ClassModel.class_date >= from_date)
        if to_date:
            filters.append(ClassModel.class_date <= to_date)

        if filters:
            query = query.where(and_(*filters))

        result = await db.execute(query)
        classes_db = result.scalars().all()

        validated_data = [ClassSchema.model_validate(c) for c in classes_db]

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Classes retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_classes")

@router.get("/{class_id}", response_model=ApiResponse)
async def get_class(class_id: int, db: AsyncSession = Depends(get_db)):
    try:
        if class_id <= 0:
            raise BadRequestError("Invalid class ID")

        query = (
            select(ClassModel)
            .options(
                joinedload(ClassModel.class_type),
                joinedload(ClassModel.room).joinedload(RoomModel.gym)
            )
        ).where(ClassModel.class_id == class_id)
        result = await db.execute(query)
        class_db = result.scalar_one_or_none()

        if not class_db:
            raise NotFoundError(resource="Class", id=class_id)

        return {
            "status": "SUCCEEDED",
            "data": ClassSchema.model_validate(class_db),
            "message": "Class found"
        }
    except Exception as e:
        return handle_error(e, context="get_class")


@router.post("/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_class(
    payload: ClassCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Validate class type exists
        if payload.class_type_id <= 0:
            raise BadRequestError("Invalid class type ID")

        class_type = await db.get(ClassTypeModel, payload.class_type_id)
        if not class_type:
            raise NotFoundError(resource="ClassType", id=payload.class_type_id)

        # Validate room exists
        if payload.room_id <= 0:
            raise BadRequestError("Invalid room ID")

        room = await db.get(RoomModel, payload.room_id)
        if not room:
            raise NotFoundError(resource="Room", id=payload.room_id)


        # Validate class date
        if not payload.class_date:
            raise BadRequestError("Class date is required")

        if payload.class_date < date.today():
            raise BadRequestError("Class date cannot be in the past")

        # Validate duration
        if payload.duration < 15:
            raise BadRequestError("Duration must be at least 15 minutes")
        if payload.duration > 180:
            raise BadRequestError("Duration cannot exceed 180 minutes")
        if payload.duration % 5 != 0:
            raise BadRequestError("Duration must be in multiples of 5 minutes")

        # Validate capacity
        if payload.capacity < 1:
            raise BadRequestError("Capacity must be at least 1")
        if payload.capacity > 100:
            raise BadRequestError("Capacity cannot exceed 100 people")

        new_class = ClassModel(**payload.model_dump())
        db.add(new_class)
        await db.commit()

        query = (
            select(ClassModel)
            .options(
                joinedload(ClassModel.class_type),
                joinedload(ClassModel.room).joinedload(RoomModel.gym)
            )
            .where(ClassModel.class_id == new_class.class_id)
        )
        result = await db.execute(query)
        class_with_relations = result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": ClassSchema.model_validate(class_with_relations),
            "message": "Class created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_class")


@router.patch("/{class_id}", response_model=ApiResponse)
async def update_class(
    class_id: int,
    payload: ClassUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        if class_id <= 0:
            raise BadRequestError("Invalid class ID")

        db_class = await db.get(ClassModel, class_id)
        if not db_class:
            raise NotFoundError(resource="Class", id=class_id)

        update_data = payload.model_dump(exclude_unset=True)
        if not update_data:
            raise BadRequestError("No fields provided for update")

        # Validate class type if being updated
        if "class_type_id" in update_data:
            if update_data["class_type_id"] <= 0:
                raise BadRequestError("Invalid class type ID")

            class_type = await db.get(ClassTypeModel, update_data["class_type_id"])
            if not class_type:
                raise NotFoundError(resource="ClassType", id=update_data["class_type_id"])

        # Validate room if being updated
        if "room_id" in update_data:
            if update_data["room_id"] <= 0:
                raise BadRequestError("Invalid room ID")

            room = await db.get(RoomModel, update_data["room_id"])
            if not room:
                raise NotFoundError(resource="Room", id=update_data["room_id"])

       

        # Validate class date if being updated
        if "class_date" in update_data:
            if update_data["class_date"] < date.today():
                raise BadRequestError("Class date cannot be in the past")

            # Only check registrations if date actually changed
            if update_data["class_date"] != db_class.class_date:
                query_conflict = (
                    select(RegistrationModel)
                    .where(RegistrationModel.class_id == class_id)
                    .where(RegistrationModel.registration_date >= update_data["class_date"])
                )
                conflict_result = await db.execute(query_conflict)
                if conflict_result.scalars().first():
                    raise BadRequestError(
                        "Cannot change class date: Existing registrations would become invalid "
                        "(registration date would be on or after the new class date)"
                    )

        # Validate duration if being updated
        if "duration" in update_data:
            if update_data["duration"] < 15:
                raise BadRequestError("Duration must be at least 15 minutes")
            if update_data["duration"] > 180:
                raise BadRequestError("Duration cannot exceed 180 minutes")
            if update_data["duration"] % 5 != 0:
                raise BadRequestError("Duration must be in multiples of 5 minutes")

        # Validate capacity if being updated
        if "capacity" in update_data:
            if update_data["capacity"] < 1:
                raise BadRequestError("Capacity must be at least 1")
            if update_data["capacity"] > 100:
                raise BadRequestError("Capacity cannot exceed 100 people")

            # Check if new capacity is less than current registrations
            count_result = await db.execute(
                select(func.count()).select_from(RegistrationModel)
                .where(RegistrationModel.class_id == class_id)
            )
            current_registrations = count_result.scalar()

            if update_data["capacity"] < current_registrations:
                raise BadRequestError(
                    f"Cannot reduce capacity to {update_data['capacity']} because "
                    f"there are {current_registrations} existing registrations"
                )

        for key, value in update_data.items():
            setattr(db_class, key, value)

        await db.commit()

        query = (
            select(ClassModel)
            .options(
                joinedload(ClassModel.class_type),
                joinedload(ClassModel.room).joinedload(RoomModel.gym)
            )
            .where(ClassModel.class_id == class_id)
        )
        result = await db.execute(query)
        class_with_relations = result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": ClassSchema.model_validate(class_with_relations),
            "message": "Class updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_class")

@router.delete("/{class_id}", response_model=ApiResponse)
async def delete_class(class_id: int, db: AsyncSession = Depends(get_db)):
    try:
        if class_id <= 0:
            raise BadRequestError("Invalid class ID")

        db_class = await db.get(ClassModel, class_id)
        if not db_class:
            raise NotFoundError(resource="Class", id=class_id)

        # Check if class has registrations
        count_result = await db.execute(
            select(func.count()).select_from(RegistrationModel)
            .where(RegistrationModel.class_id == class_id)
        )
        registrations_count = count_result.scalar()

        if registrations_count > 0:
            raise BadRequestError(
                f"Cannot delete class because it has {registrations_count} existing registrations. "
                "Remove or cancel all registrations first."
            )

        await db.delete(db_class)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Class deleted successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="delete_class")