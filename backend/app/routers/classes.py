from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
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
    room_id: Optional[int] = Query(None),
    class_type_id: Optional[int] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None)
):
    try:
        query = (
            select(ClassModel)
            .options(
                joinedload(ClassModel.class_type),
                joinedload(ClassModel.room)
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
        query = (
            select(ClassModel)
            .options(
                joinedload(ClassModel.class_type),
                joinedload(ClassModel.room)
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

        class_type = await db.get(ClassTypeModel, payload.class_type_id)
        if not class_type:
            raise NotFoundError(resource="ClassType")
        room = await db.get(RoomModel, payload.room_id)
        if not room:
            raise NotFoundError(resource="Room")

        new_class = ClassModel(**payload.model_dump())
        db.add(new_class)
        await db.commit()

        query = (
            select(ClassModel)
            .options(
                joinedload(ClassModel.class_type),
                joinedload(ClassModel.room)
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
        db_class = await db.get(ClassModel, class_id)

        if not db_class:
            raise NotFoundError(resource="Class", id=class_id)

        update_data = payload.model_dump(exclude_unset=True)

        if "class_type_id" in update_data:
            class_type = await db.get(ClassTypeModel, update_data["class_type_id"])
            if not class_type:
                raise NotFoundError(resource="ClassType")

        if "room_id" in update_data:
            room = await db.get(RoomModel, update_data["room_id"])
            if not room:
                raise NotFoundError(resource="Room")

        if "class_date" in update_data:
            new_class_date = update_data["class_date"]

            query_conflict = (
                select(RegistrationModel)
                .where(RegistrationModel.class_id == class_id)
                .where(RegistrationModel.registration_date >= new_class_date)
            )
            conflict_result = await db.execute(query_conflict)
            if conflict_result.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot change class date: Existing registrations would become invalid."
                )

        for key, value in update_data.items():
            setattr(db_class, key, value)

        await db.commit()

        query = (
            select(ClassModel)
            .options(
                joinedload(ClassModel.class_type),
                joinedload(ClassModel.room)
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
        db_class = await db.get(ClassModel, class_id)
        if not db_class:
            raise NotFoundError(resource="Class", id=class_id)

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