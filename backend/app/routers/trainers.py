from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import Optional
from decimal import Decimal

from ..database import get_db
from ..models import Trainer as TrainerModel
from ..schemas import ApiResponse, TrainerSchema
from ..utils.error_handle import handle_error, NotFoundError

router = APIRouter(
    prefix="/trainers",
    tags=["trainers"]
)

@router.get("/", response_model=ApiResponse)
async def get_trainers(
    db: AsyncSession = Depends(get_db),
    specialization: Optional[str] = Query(None, min_length=3),
    min_hourly_wage: Optional[Decimal] = Query(None),
    name: Optional[str] = Query(None),
    is_employed: Optional[bool] = Query(None)
):
    try:
        # SQLAlchemy automatycznie dołączy tabelę Employee
        query = select(TrainerModel)

        filters = []
        if specialization:
            filters.append(TrainerModel.specialization.ilike(f"%{specialization}%"))
        if min_hourly_wage:
            filters.append(TrainerModel.hourly_wage >= min_hourly_wage)
        if name:
            filters.append(TrainerModel.name.ilike(f"%{name}%"))
        if is_employed is not None:
            filters.append(TrainerModel.is_employed == is_employed)

        if filters:
            query = query.where(and_(*filters))

        # Sortowanie po specjalizacji i nazwisku
        query = query.order_by(TrainerModel.specialization, TrainerModel.surname)

        result = await db.execute(query)
        trainers_db = result.scalars().all()

        validated_data = [TrainerSchema.model_validate(t) for t in trainers_db]

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": f"Successfully retrieved {len(validated_data)} trainers"
        }
    except Exception as e:
        return handle_error(e, context="get_trainers")

@router.get("/{employee_id}", response_model=ApiResponse)
async def get_trainer(employee_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = select(TrainerModel).where(TrainerModel.employee_id == employee_id)
        
        result = await db.execute(query)
        trainer_db = result.scalar_one_or_none()

        if not trainer_db:
            raise NotFoundError(resource="Trainer", id=employee_id)

        return {
            "status": "SUCCEEDED",
            "data": TrainerSchema.model_validate(trainer_db),
            "message": "Trainer details found"
        }
    except Exception as e:
        return handle_error(e, context="get_trainer")