from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import joinedload
from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status

from ..database import get_db
from ..models import Contract as ContractModel
from ..models import Gym as GymModel
from ..models import Gym as GymModel
from ..schemas import ContractSchema, ApiResponse, ContractCreate, ContractUpdate
from ..utils.error_handle import handle_error, NotFoundError, BadRequestError


router = APIRouter(
    prefix="/contracts",
    tags=["contracts"]
)

@router.get("/", response_model=ApiResponse)
async def get_contracts(
    db: AsyncSession = Depends(get_db),
    gym_id: Optional[int] = Query(None),
    sponsor_id: Optional[int] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None)
):
    try:
        query = (
            select(ContractModel)
            .options(
                joinedload(ContractModel.gym).joinedload(GymModel.address), 
                joinedload(ContractModel.sponsor)
            )
        )
                
        filters = []
        if gym_id:
            filters.append(ContractModel.gym_id == gym_id)
        if sponsor_id:
            filters.append(ContractModel.sponsor_id == sponsor_id)
        if from_date:
            filters.append(ContractModel.contract_date >= from_date)
        if to_date:
            filters.append(ContractModel.expiration_date <= to_date)

        if filters:
            query = query.where(and_(*filters))
        
        result = await db.execute(query)
        contracts = result.scalars().unique().all()

        validated_contracts = [ContractSchema.model_validate(c) for c in contracts]

        return {
            "status": "SUCCEEDED",
            "data": validated_contracts,
            "message": "Contracts retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_contracts")

@router.get("/{contract_id}", response_model=ApiResponse)
async def get_contract(contract_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = (
            select(ContractModel)
            .options(
                joinedload(ContractModel.gym).joinedload(GymModel.address),
                joinedload(ContractModel.sponsor))
            .where(ContractModel.contract_id == contract_id)
        )
        result = await db.execute(query)
        contract_db = result.scalar_one_or_none()

        if not contract_db:
            raise NotFoundError(resource="Contract", id=contract_id)

        return {
            "status": "SUCCEEDED",
            "data": ContractSchema.model_validate(contract_db),
            "message": "Contract found"
        }
    except Exception as e:
        return handle_error(e, context="get_contract")
    
@router.post("/", response_model=ApiResponse)
async def create_contract(contract_data: ContractCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Validate that there aren't any overlapping contracts
        query = (
            select(ContractModel)
            .where(
                ContractModel.gym_id == contract_data.gym_id,
                ContractModel.sponsor_id == contract_data.sponsor_id,
                ContractModel.expiration_date >= contract_data.contract_date
            )
        )
        result = await db.execute(query)
        existing_contract = result.scalars().first()

        if existing_contract is not None:
            raise BadRequestError("Overlapping contract exists for this gym and sponsor")

        contract_dict = contract_data.model_dump()
        new_contract = ContractModel(**contract_dict)

        db.add(new_contract)
        await db.commit()

        query = (
            select(ContractModel)
            .where(ContractModel.contract_id == new_contract.contract_id)
            .options(
                joinedload(ContractModel.gym).joinedload(GymModel.address),
                joinedload(ContractModel.sponsor)
            )
        )
        refreshed_result = await db.execute(query)
        complete_contract = refreshed_result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": ContractSchema.model_validate(complete_contract),
            "message": "Contract created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_contract")

@router.delete("/{contract_id}", response_model=ApiResponse)
async def delete_contract(contract_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(ContractModel).where(ContractModel.contract_id == contract_id)
        )
        contract_to_delete = result.scalar_one_or_none()

        if not contract_to_delete:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Contract with ID {contract_id} not found"
            )

        await db.delete(contract_to_delete)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Contract deleted successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="delete_contract")
    
@router.patch("/{contract_id}", response_model=ApiResponse)
async def update_contract(contract_id: int, contract_data: ContractUpdate, db: AsyncSession = Depends(get_db)):
    try:
        db_contract = await db.get(ContractModel, contract_id)
        if not db_contract:
            raise NotFoundError(resource="Class", id=contract_id)

        update_data = contract_data.model_dump(exclude_unset=True)
        if not update_data:
            raise BadRequestError("No fields provided for update")

        # Validate that there aren't any overlapping contracts
        query = (
            select(ContractModel)
            .where(
                ContractModel.gym_id == db_contract.gym_id,
                ContractModel.sponsor_id == db_contract.sponsor_id,
                ContractModel.expiration_date >= db_contract.contract_date,
                ContractModel.contract_id != contract_id
            )
        )
        result = await db.execute(query)
        existing_contract = result.scalars().first()

        if existing_contract is not None:
            raise BadRequestError("Overlapping contract exists for this gym and sponsor")
        
        for key, value in update_data.items():
            setattr(db_contract, key, value)

        await db.commit()

        query = (
            select(ContractModel)
            .options(
                joinedload(ContractModel.gym).joinedload(GymModel.address),
                joinedload(ContractModel.sponsor)
            )
            .where(ContractModel.contract_id == contract_id)
        )
        result = await db.execute(query)
        full_contract = result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": ContractSchema.model_validate(full_contract),
            "message": "Contract updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_contract")