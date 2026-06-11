from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from sqlalchemy.orm import selectinload
from typing import Optional

from ..database import get_db
from ..models import (
    TransactionClient as TransactionClientModel,
    TransactionArticle as TransactionArticleModel,
    Client as ClientModel,
    Article as ArticleModel,
    Receptionist as ReceptionistModel
)
from ..schemas import ApiResponse, TransactionClientSchema, TransactionClientCreate, TransactionClientUpdate
from ..utils.error_handle import handle_error, NotFoundError, BadRequestError

router = APIRouter(
    prefix="/transactions",
    tags=["transactions"]
)

@router.get("/", response_model=ApiResponse)
async def get_transactions(
    db: AsyncSession = Depends(get_db),
    client_id: Optional[int] = Query(None, gt=0),
    receptionist_employee_id: Optional[int] = Query(None, gt=0)
):
    try:
        query = select(TransactionClientModel).order_by(TransactionClientModel.transaction_client_id.desc()).options(
            selectinload(TransactionClientModel.articles).selectinload(TransactionArticleModel.article)
        )

        if client_id:
            query = query.where(TransactionClientModel.client_id == client_id)
        if receptionist_employee_id:
            query = query.where(TransactionClientModel.receptionist_employee_id == receptionist_employee_id)

        result = await db.execute(query)
        transactions_db = result.scalars().all()

        validated_data = [TransactionClientSchema.model_validate(t) for t in transactions_db]

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Transactions retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_transactions")

@router.get("/{transaction_id}", response_model=ApiResponse)
async def get_transaction(transaction_id: int, db: AsyncSession = Depends(get_db)):
    try:
        if transaction_id <= 0:
            raise BadRequestError("Invalid transaction ID")

        query = select(TransactionClientModel).options(
            selectinload(TransactionClientModel.articles).selectinload(TransactionArticleModel.article)
        ).where(TransactionClientModel.transaction_client_id == transaction_id)
        
        result = await db.execute(query)
        db_transaction = result.scalar_one_or_none()

        if not db_transaction:
            raise NotFoundError(resource="Transaction", id=transaction_id)

        return {
            "status": "SUCCEEDED",
            "data": TransactionClientSchema.model_validate(db_transaction),
            "message": "Transaction found"
        }
    except Exception as e:
        return handle_error(e, context="get_transaction")

@router.post("/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: TransactionClientCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        if payload.client_id <= 0:
            raise BadRequestError("Invalid client ID")
        if payload.receptionist_employee_id <= 0:
            raise BadRequestError("Invalid receptionist employee ID")
            
        client = await db.get(ClientModel, payload.client_id)
        if not client:
            raise NotFoundError(resource="Client", id=payload.client_id)
            
        receptionist = await db.get(ReceptionistModel, payload.receptionist_employee_id)
        if not receptionist:
            raise NotFoundError(resource="Receptionist", id=payload.receptionist_employee_id)

        if not payload.articles:
            raise BadRequestError("Transaction must contain at least one article")

        for art in payload.articles:
            if art.quantity <= 0:
                raise BadRequestError(f"Quantity must be greater than 0 for article {art.article_id}")
            article_db = await db.get(ArticleModel, art.article_id)
            if not article_db:
                raise NotFoundError(resource="Article", id=art.article_id)

        result = await db.execute(select(TransactionClientModel.transaction_client_id).order_by(TransactionClientModel.transaction_client_id.desc()).limit(1))
        max_id = result.scalar_one_or_none() or 0
        new_id = max_id + 1

        new_transaction = TransactionClientModel(
            transaction_client_id=new_id,
            client_id=payload.client_id,
            receptionist_employee_id=payload.receptionist_employee_id,
            transaction_date=payload.transaction_date
        )
        db.add(new_transaction)
        
        for art in payload.articles:
            new_ta = TransactionArticleModel(
                transaction_client_id=new_id,
                article_id=art.article_id,
                quantity=art.quantity
            )
            db.add(new_ta)

        await db.commit()

        query = select(TransactionClientModel).options(
            selectinload(TransactionClientModel.articles).selectinload(TransactionArticleModel.article)
        ).where(TransactionClientModel.transaction_client_id == new_id)
        
        result = await db.execute(query)
        created_transaction = result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": TransactionClientSchema.model_validate(created_transaction),
            "message": "Transaction created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_transaction")

@router.patch("/{transaction_id}", response_model=ApiResponse)
async def update_transaction(
    transaction_id: int,
    payload: TransactionClientUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        if transaction_id <= 0:
            raise BadRequestError("Invalid transaction ID")

        query = select(TransactionClientModel).options(
            selectinload(TransactionClientModel.articles)
        ).where(TransactionClientModel.transaction_client_id == transaction_id)
        
        result = await db.execute(query)
        db_transaction = result.scalar_one_or_none()

        if not db_transaction:
            raise NotFoundError(resource="Transaction", id=transaction_id)

        update_data = payload.model_dump(exclude_unset=True)
        if not update_data:
            raise BadRequestError("No fields provided for update")

        if "client_id" in update_data:
            if update_data["client_id"] <= 0:
                raise BadRequestError("Invalid client ID")
            client = await db.get(ClientModel, update_data["client_id"])
            if not client:
                raise NotFoundError(resource="Client", id=update_data["client_id"])
                
        if "receptionist_employee_id" in update_data:
            if update_data["receptionist_employee_id"] <= 0:
                raise BadRequestError("Invalid receptionist employee ID")
            receptionist = await db.get(ReceptionistModel, update_data["receptionist_employee_id"])
            if not receptionist:
                raise NotFoundError(resource="Receptionist", id=update_data["receptionist_employee_id"])

        if "articles" in update_data:
            existing_articles = {art.article_id: art for art in db_transaction.articles}
            new_article_ids = set()

            for art_data in update_data["articles"]:
                a_id = art_data["article_id"]
                qty = art_data["quantity"]
                new_article_ids.add(a_id)
                
                if qty <= 0:
                    raise BadRequestError(f"Quantity must be greater than 0 for article {a_id}")
                
                article_db = await db.get(ArticleModel, a_id)
                if not article_db:
                    raise NotFoundError(resource="Article", id=a_id)
                    
                if a_id in existing_articles:
                    existing_articles[a_id].quantity = qty
                else:
                    new_ta = TransactionArticleModel(
                        transaction_client_id=transaction_id,
                        article_id=a_id,
                        quantity=qty
                    )
                    db_transaction.articles.append(new_ta)
            
            for old_a_id, old_art in list(existing_articles.items()):
                if old_a_id not in new_article_ids:
                    db_transaction.articles.remove(old_art)

        for key, value in update_data.items():
            if key != "articles":
                setattr(db_transaction, key, value)

        await db.commit()

        # Refresh
        query_refresh = select(TransactionClientModel).options(
            selectinload(TransactionClientModel.articles).selectinload(TransactionArticleModel.article)
        ).where(TransactionClientModel.transaction_client_id == transaction_id)
        
        res = await db.execute(query_refresh)
        updated_transaction = res.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": TransactionClientSchema.model_validate(updated_transaction),
            "message": "Transaction updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_transaction")

@router.delete("/{transaction_id}", response_model=ApiResponse)
async def delete_transaction(transaction_id: int, db: AsyncSession = Depends(get_db)):
    try:
        if transaction_id <= 0:
            raise BadRequestError("Invalid transaction ID")

        db_transaction = await db.get(TransactionClientModel, transaction_id)
        if not db_transaction:
            raise NotFoundError(resource="Transaction", id=transaction_id)

        # First delete transaction articles
        await db.execute(
            TransactionArticleModel.__table__.delete().where(
                TransactionArticleModel.transaction_client_id == transaction_id
            )
        )

        await db.delete(db_transaction)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Transaction deleted successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="delete_transaction")

@router.get("/{transaction_id}/total", response_model=ApiResponse)
async def get_transaction_total(transaction_id: int, db: AsyncSession = Depends(get_db)):
    try:
        if transaction_id <= 0:
            raise BadRequestError("Invalid transaction ID")

        db_transaction = await db.get(TransactionClientModel, transaction_id)
        if not db_transaction:
            raise NotFoundError(resource="Transaction", id=transaction_id)

        result = await db.execute(
            text("SELECT get_transaction_total(:t_id)"), 
            {"t_id": transaction_id}
        )
        total = result.scalar()
        
        return {
            "status": "SUCCEEDED",
            "data": float(total) if total else 0.0,
            "message": "Transaction total retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_transaction_total")
