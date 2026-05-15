from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from typing import Optional

from ..database import get_db
from ..models import Gym as GymModel
from ..models import Address as AddressModel
from ..schemas import GymSchema, ApiResponse
from ..utils.error_handle import handle_error, NotFoundError


router = APIRouter(
    prefix="/gyms",
    tags=["gyms"]
)

@router.get("/", response_model=ApiResponse)
async def get_gyms(db: AsyncSession = Depends(get_db), city: Optional[str] = Query(None)):
    try:
        query = (select(GymModel).options(joinedload(GymModel.address)))
        
        if city is not None:
            query = query.join(GymModel.address).where(AddressModel.city == city)
        
        result = await db.execute(query)
        gyms = result.scalars().unique().all()

        validated_gyms = [GymSchema.model_validate(g) for g in gyms]

        return {
            "status": "SUCCEEDED",
            "data": validated_gyms,
            "message": "Gyms retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_gyms")

@router.get("/{gym_id}", response_model=ApiResponse)
async def get_gym(gym_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = (
            select(GymModel)
            .options(joinedload(GymModel.address))
            .where(GymModel.gym_id == gym_id)
        )
        result = await db.execute(query)
        gym_db = result.scalar_one_or_none()

        if not gym_db:
            raise NotFoundError(resource="Gym", id=gym_id)

        return {
            "status": "SUCCEEDED",
            "data": GymSchema.model_validate(gym_db),
            "message": "Gym found"
        }
    except Exception as e:
        return handle_error(e, context="get_gym")
    
@router.post("/", response_model=ApiResponse)
async def create_gym(gym_data: GymSchema, db: AsyncSession = Depends(get_db)):
    try:
        new_gym = GymModel(**gym_data.model_dump())

        db.add(new_gym)
        await db.commit()
        await db.refresh(new_gym)

        return {
            "status": "SUCCEEDED",
            "data": GymSchema.model_validate(new_gym),
            "message": "Gym created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_gym")