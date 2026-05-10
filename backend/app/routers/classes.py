from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
from typing import Optional
from datetime import date


from ..database import get_db
from ..models import Class as ClassModel
from ..schemas import ApiResponse, ClassSchema
from ..utils.error_handle import handle_error, NotFoundError

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
        query = query = (
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