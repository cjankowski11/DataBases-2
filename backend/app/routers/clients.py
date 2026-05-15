from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/clients",
    tags=["Clients"]
)

@router.get("/", response_model=List[schemas.ClientSchema])
async def get_clients(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Client).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{client_id}", response_model=schemas.ClientSchema)
async def get_client(client_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Client).filter(models.Client.client_id == client_id))
    client = result.scalar_one_or_none()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.get("/{client_id}/total_spent", response_model=float)
async def get_client_total_spent(client_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT get_client_total_spent(:client_id)"), 
        {"client_id": client_id}
    )
    total = result.scalar()
    return float(total) if total else 0.0
