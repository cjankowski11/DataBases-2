from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import Optional, List

from ..database import get_db
from ..models import Receptionist as ReceptionistModel
from ..schemas import ApiResponse, ReceptionistSchema
from ..utils.error_handle import handle_error, NotFoundError

router = APIRouter(
    prefix="/receptionists",
    tags=["receptionists"]
)

@router.get("/", response_model=ApiResponse)
async def get_receptionists(
    db: AsyncSession = Depends(get_db),
    shift: Optional[str] = Query(None, max_length=16),
    name: Optional[str] = Query(None, min_length=2),
    is_employed: Optional[bool] = Query(None)
):
    try:
        query = select(ReceptionistModel)

        filters = []
        if shift:
            filters.append(ReceptionistModel.shift == shift)
        if name:
            filters.append(ReceptionistModel.name.ilike(f"%{name}%"))
        if is_employed is not None:
            filters.append(ReceptionistModel.is_employed == is_employed)

        if filters:
            query = query.where(and_(*filters))

        result = await db.execute(query)
        receptionists_db = result.scalars().all()

        validated_data = [ReceptionistSchema.model_validate(r) for r in receptionists_db]

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": f"Retrieved {len(validated_data)} receptionists"
        }
    except Exception as e:
        return handle_error(e, context="get_receptionists")

@router.get("/{employee_id}", response_model=ApiResponse)
async def get_receptionist(employee_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = select(ReceptionistModel).where(ReceptionistModel.employee_id == employee_id)
        
        result = await db.execute(query)
        receptionist_db = result.scalar_one_or_none()

        if not receptionist_db:
            raise NotFoundError(resource="Receptionist", id=employee_id)

        return {
            "status": "SUCCEEDED",
            "data": ReceptionistSchema.model_validate(receptionist_db),
            "message": "Receptionist details retrieved"
        }
    except Exception as e:
        return handle_error(e, context="get_receptionist")