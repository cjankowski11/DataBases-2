from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from typing import Optional

from ..database import get_db
from ..models import Gym as GymModel
from ..models import Address as AddressModel
from ..schemas import GymSchema, ApiResponse, GymCreate, GymUpdate
from ..utils.error_handle import handle_error, NotFoundError, BadRequestError


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
async def create_gym(gym_data: GymCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Check if other gym has this address
        query = (
            select(GymModel)
            .options(joinedload(GymModel.address))
            .where(GymModel.address_id == gym_data.address_id)
        )
        result = await db.execute(query)
        existing_gym = result.scalars().first()

        if existing_gym is not None:
            raise BadRequestError("Another gym already exists at selected location")

        new_gym = GymModel(**gym_data.model_dump())

        db.add(new_gym)
        await db.commit()

        query = (
            select(GymModel)
            .where(GymModel.gym_id == new_gym.gym_id)
            .options(
                joinedload(GymModel.address)
            )
        )
        refreshed_result = await db.execute(query)
        complete_gym = refreshed_result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": GymSchema.model_validate(complete_gym),
            "message": "Gym created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_gym")


@router.delete("/{gym_id}", response_model=ApiResponse)
async def delete_gym(gym_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(GymModel).where(GymModel.gym_id == gym_id)
        )
        gym_to_delete = result.scalar_one_or_none()

        if not gym_to_delete:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Gym with ID {gym_id} not found"
            )

        await db.delete(gym_to_delete)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Gym deleted successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="delete_gym")
    
@router.patch("/{gym_id}", response_model=ApiResponse)
async def update_gym(gym_id: int, gym_data: GymUpdate, db: AsyncSession = Depends(get_db)):
    try:
        db_gym = await db.get(GymModel, gym_id)
        if not db_gym:
            raise NotFoundError(resource="Gym", id=gym_id)

        update_data = gym_data.model_dump(exclude_unset=True)
        if not update_data:
            raise BadRequestError("No fields provided for update")
        
        for key, value in update_data.items():
            setattr(db_gym, key, value)

        await db.commit()

        query = (
            select(GymModel)
            .options(
                joinedload(GymModel.address),
            )
            .where(GymModel.gym_id == gym_id)
        )
        result = await db.execute(query)
        full_gym = result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": GymSchema.model_validate(full_gym),
            "message": "Gym updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_gym")