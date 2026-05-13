from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models import Sponsor as SponsorModel
from ..schemas import SponsorSchema, ApiResponse, SponsorCreate
from ..utils.error_handle import handle_error, NotFoundError


router = APIRouter(
    prefix="/sponsors",
    tags=["sponsors"]
)

@router.get("/", response_model=ApiResponse)
async def get_sponsors(db: AsyncSession = Depends(get_db)):
    try:
        query = select(SponsorModel)
        result = await db.execute(query)
        sponsors = result.scalars().all()

        validated_sponsors = [SponsorSchema.model_validate(s) for s in sponsors]

        return {
            "status": "SUCCEEDED",
            "data": validated_sponsors,
            "message": "Sponsors retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_sponsors")

@router.get("/{sponsor_id}", response_model=ApiResponse)
async def get_sponsor(sponsor_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = select(SponsorModel).where(SponsorModel.sponsor_id == sponsor_id)
        result = await db.execute(query)
        sponsor_db = result.scalar_one_or_none()

        if not sponsor_db:
            raise NotFoundError(resource="Sponsor", id=sponsor_db)

        return {
            "status": "SUCCEEDED",
            "data": SponsorSchema.model_validate(sponsor_db),
            "message": "Sponsor found"
        }
    except Exception as e:
        return handle_error(e, context="get_sponsors")
    
@router.post("/", response_model=ApiResponse)
async def create_sponsor(sponsor_in: SponsorCreate, db: AsyncSession = Depends(get_db)):
    try:
        new_sponsor = SponsorModel(**sponsor_in.model_dump())

        db.add(new_sponsor)
        await db.commit()
        await db.refresh(new_sponsor)

        return {
            "status": "SUCCEEDED",
            "data": SponsorSchema.model_validate(new_sponsor),
            "message": "Sponsor created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_sponsor")