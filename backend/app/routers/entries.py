from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from ..database import get_db
from ..models import Entry as EntryModel,Gym as GymModel, Address as AddressModel
from ..schemas import EntrySchema, ApiResponse
from ..utils.error_handle import handle_error, NotFoundError


router = APIRouter(
    prefix="/entries",
    tags=["entries"]
)

@router.get("/", response_model=ApiResponse)
async def get_entries(db: AsyncSession = Depends(get_db)):
    try:
        query = select(EntryModel).options(
            joinedload(EntryModel.client),
            joinedload(EntryModel.gym).joinedload(GymModel.address)
        )
        result = await db.execute(query)
        entries = result.scalars().all()

        validated_data = [EntrySchema.model_validate(e) for e in entries]

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Entries retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_entries")

@router.get("/{entry_id}", response_model=ApiResponse)
async def get_entry(entry_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = select(EntryModel).where(EntryModel.entry_id == entry_id).options(
            joinedload(EntryModel.client),
            joinedload(EntryModel.gym).joinedload(GymModel.address)
        )
        result = await db.execute(query)
        entry_db = result.scalar_one_or_none()

        if not entry_db:
            raise NotFoundError(resource="Entry", id=entry_id)

        return {
            "status": "SUCCEEDED",
            "data": EntrySchema.model_validate(entry_db),
            "message": "Entry found"
        }
    except Exception as e:
        return handle_error(e, context="get_entry")
