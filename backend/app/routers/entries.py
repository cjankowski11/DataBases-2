from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import SQLAlchemyError
from ..database import get_db
from ..models import Entry as EntryModel,Gym as GymModel, Address as AddressModel
from ..schemas import EntrySchema, ApiResponse, EntryCreate
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


@router.post("/", response_model=ApiResponse, status_code=201)
async def create_entry(
    payload: EntryCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        gym = await db.get(GymModel, payload.gym_id)
        if not gym:
            raise NotFoundError(resource="Gym", id=payload.gym_id)
            
        new_entry = EntryModel(**payload.model_dump())
        db.add(new_entry)
        await db.commit()
        await db.refresh(new_entry)

        query = (
            select(EntryModel)
            .where(EntryModel.entry_id == new_entry.entry_id)
            .options(
                joinedload(EntryModel.client),
                joinedload(EntryModel.gym).joinedload(GymModel.address)
            )
        )
        result = await db.execute(query)
        full = result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": EntrySchema.model_validate(full),
            "message": "Entry created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_entry")

@router.delete("/{entry_id}", response_model=ApiResponse)
async def delete_entry(entry_id: int, db: AsyncSession = Depends(get_db)):
    try:
        entry_db = await db.get(EntryModel, entry_id)
        if not entry_db:
            raise NotFoundError(resource="Entry", id=entry_id)
            
        await db.delete(entry_db)
        await db.commit()
        
        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Entry deleted successfully"
        }
    except Exception as e:
        return handle_error(e, context="delete_entry")

