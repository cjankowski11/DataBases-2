from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models import Address as AddressModel
from ..schemas import AddressSchema, ApiResponse, AddressCreate
from ..utils.error_handle import handle_error, NotFoundError


router = APIRouter(
    prefix="/addresses",
    tags=["addresses"]
)

@router.get("/", response_model=ApiResponse)
async def get_addresses(db: AsyncSession = Depends(get_db)):
    try:
        query = select(AddressModel)
        result = await db.execute(query)
        addresses = result.scalars().all()

        validated_addresses = [AddressSchema.model_validate(a) for a in addresses]

        return {
            "status": "SUCCEEDED",
            "data": validated_addresses,
            "message": "Addresses retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_addresses")

@router.get("/{address_id}", response_model=ApiResponse)
async def get_address(address_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = select(AddressModel).where(AddressModel.address_id == address_id)
        result = await db.execute(query)
        address_db = result.scalar_one_or_none()

        if not address_db:
            raise NotFoundError(resource="Sponsor", id=address_id)

        return {
            "status": "SUCCEEDED",
            "data": AddressSchema.model_validate(address_db),
            "message": "Address found"
        }
    except Exception as e:
        return handle_error(e, context="get_address")
    
@router.post("/", response_model=ApiResponse)
async def create_address(address_in: AddressCreate, db: AsyncSession = Depends(get_db)):
    try:
        new_address = AddressModel(**address_in.model_dump())

        db.add(new_address)
        await db.commit()
        await db.refresh(new_address)

        return {
            "status": "SUCCEEDED",
            "data": AddressSchema.model_validate(new_address),
            "message": "Address created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_address")