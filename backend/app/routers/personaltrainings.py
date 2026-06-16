from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import date, datetime

from ..database import get_db
from ..models import PersonalTraining as PersonalTrainingModel
from ..schemas import ApiResponse, PersonalTrainingSchema, PersonalTrainingCreate, PersonalTrainingUpdate
from ..utils.error_handle import handle_error, NotFoundError

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


@router.post("/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_personal_training(
    payload: PersonalTrainingCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Konwersja czasu dla POST na naive, jeśli frontend przesyła strefę
        start_time_naive = payload.start_time
        if start_time_naive and start_time_naive.tzinfo is not None:
            start_time_naive = start_time_naive.replace(tzinfo=None)

        new_training = PersonalTrainingModel(
            client_id=payload.client_id,
            trainer_id=payload.trainer_id,
            start_time=start_time_naive,
            duration=payload.duration
        )

        db.add(new_training)
        await db.commit()
        
        await db.refresh(new_training)

        query = select(PersonalTrainingModel).options(
            selectinload(PersonalTrainingModel.client),
            selectinload(PersonalTrainingModel.trainer)
        ).where(PersonalTrainingModel.personal_training_id == new_training.personal_training_id)
        
        result = await db.execute(query)
        training_with_relations = result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": PersonalTrainingSchema.model_validate(training_with_relations),
            "message": "Personal training scheduled successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_personal_training")


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


@router.delete("/{personal_training_id}", response_model=ApiResponse)
async def delete_personal_training(
    personal_training_id: int,
    db: AsyncSession = Depends(get_db)
):
    try:
        query = select(PersonalTrainingModel).where(
            PersonalTrainingModel.personal_training_id == personal_training_id
        )
        result = await db.execute(query)
        training_db = result.scalar_one_or_none()

        if not training_db:
            raise NotFoundError(resource="PersonalTraining", id=personal_training_id)

        await db.delete(training_db)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": f"Personal training with ID {personal_training_id} has been deleted successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="delete_personal_training")


@router.patch("/{personal_training_id}", response_model=ApiResponse)
async def update_personal_training(
    personal_training_id: int,
    training_update: PersonalTrainingUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        query = select(PersonalTrainingModel).where(
            PersonalTrainingModel.personal_training_id == personal_training_id
        )
        result = await db.execute(query)
        training_db = result.scalar_one_or_none()

        if not training_db:
            raise NotFoundError(resource="PersonalTraining", id=personal_training_id)

        update_data = training_update.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            if isinstance(value, datetime) and value.tzinfo is not None:
                value = value.replace(tzinfo=None)
                
            setattr(training_db, key, value)

        await db.commit()

        query_with_relations = select(PersonalTrainingModel).options(
            selectinload(PersonalTrainingModel.client),
            selectinload(PersonalTrainingModel.trainer)
        ).where(PersonalTrainingModel.personal_training_id == personal_training_id)
        
        result_updated = await db.execute(query_with_relations)
        training_updated = result_updated.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": PersonalTrainingSchema.model_validate(training_updated),
            "message": "Personal training updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_personal_training")