from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models import ClassType as ClassTypeModel
from ..schemas import ApiResponse, ClassTypeSchema
from ..utils.error_handle import handle_error, NotFoundError


router = APIRouter(
    prefix="/class_types",
    tags=["class_types"]
)

@router.get("/", response_model=ApiResponse)
async def get_class_types(db: AsyncSession = Depends(get_db)):
    try:
        query = select(ClassTypeModel)
        result = await db.execute(query)
        class_types_db = result.scalars().all()

        validated_data = [ClassTypeSchema.model_validate(c) for c in class_types_db]

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Class Types retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_class_types")

@router.get("/{class_type_id}", response_model=ApiResponse)
async def get_class_type(class_type_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = select(ClassTypeModel).where(ClassTypeModel.class_type_id == class_type_id)
        result = await db.execute(query)
        class_types_db = result.scalar_one_or_none()

        if not class_types_db:
            raise NotFoundError(resource="Class Type", id=class_type_id)

        return {
            "status": "SUCCEEDED",
            "data": ClassTypeSchema.model_validate(class_types_db),
            "message": "Class Type found"
        }
    except Exception as e:
        return handle_error(e, context="get_class_type")