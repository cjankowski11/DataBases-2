from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/articles",
    tags=["Articles"]
)

@router.get("/", response_model=List[schemas.ArticleSchema])
async def get_articles(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Article).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=schemas.ArticleSchema)
async def create_article(article: schemas.ArticleCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Article.article_id).order_by(models.Article.article_id.desc()).limit(1))
    max_id = result.scalar_one_or_none() or 0
    
    db_article = models.Article(
        article_id=max_id + 1,
        **article.model_dump()
    )
    db.add(db_article)
    await db.commit()
    await db.refresh(db_article)
    return db_article
