from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..database import get_db
from ..models import Address as AddressModel
from ..models import Gym as GymModel
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
        result = await db.execute(select(func.max(AddressModel.address_id)))
        max_id = result.scalar()
        next_id = (max_id or 0) + 1

        address_data = address_in.model_dump()
        address_data["address_id"] = next_id
        new_address = AddressModel(**address_data)
        
        db.add(new_address)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": AddressSchema.model_validate(new_address),
            "message": "Address created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_address")
    
@router.delete("/{address_id}", response_model=ApiResponse)
async def delete_address(address_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(AddressModel).where(AddressModel.address_id == address_id)
        )
        address_to_delete = result.scalar_one_or_none()

        if not address_to_delete:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Address with ID {address_id} not found"
            )
        
        gym_check = await db.execute(
            select(func.count(GymModel.gym_id)).where(GymModel.address_id == address_id)
        )
        gym_count = gym_check.scalar()
        if gym_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete this address because it is currently assigned to a gym."
            )

        await db.delete(address_to_delete)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Address deleted successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="delete_address")