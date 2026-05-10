from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from typing import Optional

from ..database import get_db
from ..models import ClassRegistration as RegistrationModel, Class as ClassModel
from ..schemas import ApiResponse, ClassRegistrationSchema
from ..utils.error_handle import handle_error, NotFoundError


router = APIRouter(prefix="/registrations", tags=["registrations"])

@router.get("/", response_model=ApiResponse)
async def get_registrations(
    db: AsyncSession = Depends(get_db),
    client_id: Optional[int] = Query(None),
    class_id: Optional[int] = Query(None)
):
    try:
        query = (
            select(RegistrationModel)
            .options(
                joinedload(RegistrationModel.client),
                joinedload(RegistrationModel.class_info).joinedload(ClassModel.class_type),
                joinedload(RegistrationModel.class_info).joinedload(ClassModel.room)
            )
        )

        if client_id is not None:
            query = query.where(RegistrationModel.client_id == client_id)
        if class_id is not None:
            query = query.where(RegistrationModel.class_id == class_id)

        result = await db.execute(query)
        registrations_db = result.scalars().all()

        validated_data = [ClassRegistrationSchema.model_validate(r) for r in registrations_db]

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Registrations retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_registrations")

@router.get("/{class_registration_id}", response_model=ApiResponse)
async def get_registration(class_registration_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = (
            select(RegistrationModel)
            .options(
                joinedload(RegistrationModel.client),
                joinedload(RegistrationModel.class_info).joinedload(ClassModel.class_type),
                joinedload(RegistrationModel.class_info).joinedload(ClassModel.room)
            )
        ).where(RegistrationModel.class_registration_id == class_registration_id)

        result = await db.execute(query)
        class_registrations_db = result.scalar_one_or_none()

        if not class_registrations_db:
            raise NotFoundError(resource="Registration", id=class_registration_id)

        return {
            "status": "SUCCEEDED",
            "data": ClassRegistrationSchema.model_validate(class_registrations_db),
            "message": "Registration found"
        }
    except Exception as e:
        return handle_error(e, context="get_registrations")