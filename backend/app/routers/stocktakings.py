from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/stocktakings",
    tags=["Stocktakings"]
)

@router.get("/", response_model=List[schemas.StocktakingSchema])
async def get_stocktakings(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Stocktaking).offset(skip).limit(limit))
    return result.scalars().all()
