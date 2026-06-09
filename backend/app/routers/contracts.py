from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
from typing import Optional
from datetime import date

from ..database import get_db
from ..models import Contract as ContractModel
from ..models import Gym as GymModel
from ..schemas import ContractSchema, ApiResponse
from ..utils.error_handle import handle_error, NotFoundError


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
                joinedload(ContractModel.gym),
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
async def create_contract(contract_data: ContractSchema, db: AsyncSession = Depends(get_db)):
    try:
        new_contract = ContractModel(**contract_data.model_dump())

        db.add(new_contract)
        await db.commit()
        await db.refresh(new_contract)

        return {
            "status": "SUCCEEDED",
            "data": ContractSchema.model_validate(new_contract),
            "message": "Contract created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_contract")