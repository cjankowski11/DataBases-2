from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import date, datetime

from ..database import get_db
from ..models import PersonalTraining as PersonalTrainingModel
from ..schemas import ApiResponse, PersonalTrainingSchema
from ..utils.error_handle import handle_error, NotFoundError


from sqlalchemy import inspect


router = APIRouter(
    prefix="/personaltrainings",
    tags=["personaltrainings"]
)

@router.get("/", response_model=ApiResponse)
async def get_personal_trainings(
    db: AsyncSession = Depends(get_db),
    trainer_id: Optional[int] = Query(None),
    client_id: Optional[int] = Query(None),
    from_date: Optional[datetime] = Query(None),
    min_duration: Optional[int] = Query(None)
):
    try:
        query = select(PersonalTrainingModel).options(
            selectinload(PersonalTrainingModel.client),
            selectinload(PersonalTrainingModel.trainer)
        )

        filters = []
        if trainer_id:
            filters.append(PersonalTrainingModel.trainer_id == trainer_id)
        if client_id:
            filters.append(PersonalTrainingModel.client_id == client_id)
        if from_date:
            filters.append(PersonalTrainingModel.start_time >= from_date)
        if min_duration:
            filters.append(PersonalTrainingModel.duration >= min_duration)

        if filters:
            query = query.where(and_(*filters))

        # Sortowanie od najnowszych treningów
        query = query.order_by(PersonalTrainingModel.start_time.desc())

        result = await db.execute(query)
        trainings_db = result.scalars().all()

        validated_data = [PersonalTrainingSchema.model_validate(t) for t in trainings_db]

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Personal trainings retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_personal_trainings")

@router.get("/{personal_training_id}", response_model=ApiResponse)
async def get_personal_training(
    personal_training_id: int, 
    db: AsyncSession = Depends(get_db)
):
    try:
        query = select(PersonalTrainingModel).options(
            selectinload(PersonalTrainingModel.client),
            selectinload(PersonalTrainingModel.trainer)
        ).where(PersonalTrainingModel.personal_training_id == personal_training_id)
        
        result = await db.execute(query)
        training_db = result.scalar_one_or_none()

        if not training_db:
            raise NotFoundError(resource="PersonalTraining", id=personal_training_id)

        return {
            "status": "SUCCEEDED",
            "data": PersonalTrainingSchema.model_validate(training_db),
            "message": "Personal training found"
        }
    except Exception as e:
        return handle_error(e, context="get_personal_training")