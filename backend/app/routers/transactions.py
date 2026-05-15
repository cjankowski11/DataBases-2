from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import text
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)

@router.get("/", response_model=List[schemas.TransactionClientSchema])
async def get_transactions(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.TransactionClient)
        .options(selectinload(models.TransactionClient.articles).selectinload(models.TransactionArticle.article))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.get("/{transaction_id}/total", response_model=float)
async def get_transaction_total(transaction_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT get_transaction_total(:t_id)"), 
        {"t_id": transaction_id}
    )
    total = result.scalar()
    return float(total) if total else 0.0

@router.post("/", response_model=schemas.TransactionClientSchema)
async def create_transaction(transaction: schemas.TransactionClientCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(models.TransactionClient.transaction_client_id).order_by(models.TransactionClient.transaction_client_id.desc()).limit(1))
        max_id = result.scalar_one_or_none() or 0
        new_id = max_id + 1

        db_transaction = models.TransactionClient(
            transaction_client_id=new_id,
            client_id=transaction.client_id,
            receptionist_employee_id=transaction.receptionist_employee_id,
            transaction_date=transaction.transaction_date
        )
        db.add(db_transaction)
        
        for art in transaction.articles:
            db_ta = models.TransactionArticle(
                transaction_client_id=new_id,
                article_id=art.article_id,
                quantity=art.quantity
            )
            db.add(db_ta)

        await db.commit()
        
        result = await db.execute(
            select(models.TransactionClient)
            .options(selectinload(models.TransactionClient.articles).selectinload(models.TransactionArticle.article))
            .filter(models.TransactionClient.transaction_client_id == new_id)
        )
        return result.scalar_one()

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Error from DB triggers/constraints: {str(e)}")
