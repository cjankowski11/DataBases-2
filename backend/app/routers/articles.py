from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from ..database import get_db
from ..models import Article as ArticleModel, TransactionArticle as TransactionArticleModel
from ..schemas import ApiResponse, ArticleSchema, ArticleCreate, ArticleUpdate
from ..utils.error_handle import handle_error, NotFoundError, BadRequestError

router = APIRouter(
    prefix="/articles",
    tags=["articles"]
)

@router.get("/", response_model=ApiResponse)
async def get_articles(
    db: AsyncSession = Depends(get_db),
    name: Optional[str] = Query(None, min_length=1, max_length=128),
    type: Optional[str] = Query(None)
):
    try:
        query = select(ArticleModel).order_by(ArticleModel.article_id.desc())
        
        if name:
            query = query.where(ArticleModel.name.ilike(f"%{name}%"))
        if type:
            query = query.where(ArticleModel.type.ilike(f"%{type}%"))
            
        result = await db.execute(query)
        articles_db = result.scalars().all()
        
        validated_data = [ArticleSchema.model_validate(a) for a in articles_db]
        
        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Articles retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_articles")

@router.get("/{article_id}", response_model=ApiResponse)
async def get_article(article_id: int, db: AsyncSession = Depends(get_db)):
    try:
        if article_id <= 0:
            raise BadRequestError("Invalid article ID")

        db_article = await db.get(ArticleModel, article_id)
        if not db_article:
            raise NotFoundError(resource="Article", id=article_id)

        return {
            "status": "SUCCEEDED",
            "data": ArticleSchema.model_validate(db_article),
            "message": "Article found"
        }
    except Exception as e:
        return handle_error(e, context="get_article")

@router.post("/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    payload: ArticleCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        if not payload.name or not payload.name.strip():
            raise BadRequestError("Article name is required")
        if payload.price < 0:
            raise BadRequestError("Price cannot be negative")
        if payload.stock < 0:
            raise BadRequestError("Stock cannot be negative")
            
        # Manual ID generation since the database lacks a sequence
        result = await db.execute(select(ArticleModel.article_id).order_by(ArticleModel.article_id.desc()).limit(1))
        max_id = result.scalar_one_or_none() or 0
        new_id = max_id + 1

        new_article = ArticleModel(article_id=new_id, **payload.model_dump())
        db.add(new_article)
        await db.commit()
        await db.refresh(new_article)

        return {
            "status": "SUCCEEDED",
            "data": ArticleSchema.model_validate(new_article),
            "message": "Article created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_article")

@router.patch("/{article_id}", response_model=ApiResponse)
async def update_article(
    article_id: int,
    payload: ArticleUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        if article_id <= 0:
            raise BadRequestError("Invalid article ID")

        db_article = await db.get(ArticleModel, article_id)
        if not db_article:
            raise NotFoundError(resource="Article", id=article_id)

        update_data = payload.model_dump(exclude_unset=True)
        if not update_data:
            raise BadRequestError("No fields provided for update")

        if "name" in update_data and (not update_data["name"] or not update_data["name"].strip()):
            raise BadRequestError("Article name cannot be empty")
        if "price" in update_data and update_data["price"] < 0:
            raise BadRequestError("Price cannot be negative")
        if "stock" in update_data and update_data["stock"] < 0:
            raise BadRequestError("Stock cannot be negative")

        for key, value in update_data.items():
            setattr(db_article, key, value)

        await db.commit()
        await db.refresh(db_article)

        return {
            "status": "SUCCEEDED",
            "data": ArticleSchema.model_validate(db_article),
            "message": "Article updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_article")

@router.delete("/{article_id}", response_model=ApiResponse)
async def delete_article(article_id: int, db: AsyncSession = Depends(get_db)):
    try:
        if article_id <= 0:
            raise BadRequestError("Invalid article ID")

        db_article = await db.get(ArticleModel, article_id)
        if not db_article:
            raise NotFoundError(resource="Article", id=article_id)

        # Check if article is used in transactions
        transactions_using = await db.execute(
            select(TransactionArticleModel).where(TransactionArticleModel.article_id == article_id)
        )
        if transactions_using.scalars().first():
            raise BadRequestError(
                f"Cannot delete article '{db_article.name}' because it has associated transactions."
            )

        await db.delete(db_article)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Article deleted successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="delete_article")
