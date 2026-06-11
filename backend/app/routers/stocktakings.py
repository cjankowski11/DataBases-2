from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from ..database import get_db
from ..models import Stocktaking as StocktakingModel, Gym as GymModel
from ..schemas import ApiResponse, StocktakingSchema, StocktakingCreate, StocktakingUpdate
from ..utils.error_handle import handle_error, NotFoundError, BadRequestError

router = APIRouter(
    prefix="/stocktakings",
    tags=["stocktakings"]
)

@router.get("/", response_model=ApiResponse)
async def get_stocktakings(
    db: AsyncSession = Depends(get_db),
    gym_id: Optional[int] = Query(None, gt=0)
):
    try:
        query = select(StocktakingModel).order_by(StocktakingModel.stocktaking_id.desc())
        
        if gym_id:
            query = query.where(StocktakingModel.gym_id == gym_id)
            
        result = await db.execute(query)
        stocktakings_db = result.scalars().all()
        
        validated_data = [StocktakingSchema.model_validate(s) for s in stocktakings_db]
        
        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Stocktakings retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_stocktakings")

@router.get("/{stocktaking_id}", response_model=ApiResponse)
async def get_stocktaking(stocktaking_id: int, db: AsyncSession = Depends(get_db)):
    try:
        if stocktaking_id <= 0:
            raise BadRequestError("Invalid stocktaking ID")

        db_stocktaking = await db.get(StocktakingModel, stocktaking_id)
        if not db_stocktaking:
            raise NotFoundError(resource="Stocktaking", id=stocktaking_id)

        return {
            "status": "SUCCEEDED",
            "data": StocktakingSchema.model_validate(db_stocktaking),
            "message": "Stocktaking found"
        }
    except Exception as e:
        return handle_error(e, context="get_stocktaking")

@router.post("/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_stocktaking(
    payload: StocktakingCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        if payload.gym_id <= 0:
            raise BadRequestError("Invalid gym ID")
            
        gym = await db.get(GymModel, payload.gym_id)
        if not gym:
            raise NotFoundError(resource="Gym", id=payload.gym_id)

        # Manual ID generation since the database lacks a sequence
        result = await db.execute(select(StocktakingModel.stocktaking_id).order_by(StocktakingModel.stocktaking_id.desc()).limit(1))
        max_id = result.scalar_one_or_none() or 0
        new_id = max_id + 1

        new_stocktaking = StocktakingModel(stocktaking_id=new_id, **payload.model_dump())
        db.add(new_stocktaking)
        await db.commit()
        await db.refresh(new_stocktaking)

        return {
            "status": "SUCCEEDED",
            "data": StocktakingSchema.model_validate(new_stocktaking),
            "message": "Stocktaking created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_stocktaking")

@router.patch("/{stocktaking_id}", response_model=ApiResponse)
async def update_stocktaking(
    stocktaking_id: int,
    payload: StocktakingUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        if stocktaking_id <= 0:
            raise BadRequestError("Invalid stocktaking ID")

        db_stocktaking = await db.get(StocktakingModel, stocktaking_id)
        if not db_stocktaking:
            raise NotFoundError(resource="Stocktaking", id=stocktaking_id)

        update_data = payload.model_dump(exclude_unset=True)
        if not update_data:
            raise BadRequestError("No fields provided for update")

        if "gym_id" in update_data:
            if update_data["gym_id"] <= 0:
                raise BadRequestError("Invalid gym ID")
            gym = await db.get(GymModel, update_data["gym_id"])
            if not gym:
                raise NotFoundError(resource="Gym", id=update_data["gym_id"])

        for key, value in update_data.items():
            setattr(db_stocktaking, key, value)

        await db.commit()
        await db.refresh(db_stocktaking)

        return {
            "status": "SUCCEEDED",
            "data": StocktakingSchema.model_validate(db_stocktaking),
            "message": "Stocktaking updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_stocktaking")

@router.delete("/{stocktaking_id}", response_model=ApiResponse)
async def delete_stocktaking(stocktaking_id: int, db: AsyncSession = Depends(get_db)):
    try:
        if stocktaking_id <= 0:
            raise BadRequestError("Invalid stocktaking ID")

        db_stocktaking = await db.get(StocktakingModel, stocktaking_id)
        if not db_stocktaking:
            raise NotFoundError(resource="Stocktaking", id=stocktaking_id)

        await db.delete(db_stocktaking)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Stocktaking deleted successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="delete_stocktaking")
