from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models import ClassType as ClassTypeModel
from ..schemas import ApiResponse, ClassTypeSchema, ClassTypeCreate, ClassTypeUpdate
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

@router.post("/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_class_type(
    payload: ClassTypeCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        new_class_type = ClassTypeModel(**payload.model_dump())
        db.add(new_class_type)
        await db.commit()
        await db.refresh(new_class_type)

        return {
            "status": "SUCCEEDED",
            "data": ClassTypeSchema.model_validate(new_class_type),
            "message": "Class created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_class_type")

@router.patch("/{class_type_id}", response_model=ApiResponse)
async def update_class_type(
    class_type_id: int,
    payload: ClassTypeUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        class_type = await db.get(ClassTypeModel, class_type_id)

        if not class_type:
            raise NotFoundError(resource="ClassType", id=class_type_id)

        update_data = payload.model_dump(exclude_unset=True)


        for key, value in update_data.items():
            setattr(class_type, key, value)

        await db.commit()
        await db.refresh(class_type)

        return {
            "status": "SUCCEEDED",
            "data": ClassTypeSchema.model_validate(class_type),
            "message": "Class type updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_class_type")

@router.delete("/{class_type_id}", response_model=ApiResponse)
async def delete_class_type(class_type_id: int, db: AsyncSession = Depends(get_db)):
    try:
        class_type = await db.get(ClassTypeModel, class_type_id)
        if not class_type:
            raise NotFoundError(resource="ClassType", id=class_type_id)

        await db.delete(class_type)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Class Type deleted successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="delete_class_type")