from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from ..database import get_db
from ..models import ClassType as ClassTypeModel, Class as ClassModel
from ..schemas import ApiResponse, ClassTypeSchema, ClassTypeCreate, ClassTypeUpdate
from ..utils.error_handle import handle_error, NotFoundError, BadRequestError


router = APIRouter(
    prefix="/class_types",
    tags=["class_types"]
)

@router.get("/", response_model=ApiResponse)
async def get_class_types(
    db: AsyncSession = Depends(get_db),
    name: Optional[str] = Query(None, min_length=2, max_length=32),
    difficulty: Optional[int] = Query(None, ge=1, le=5)
):
    try:
        query = select(ClassTypeModel)

        if name:
            query = query.where(ClassTypeModel.name.ilike(f"%{name}%"))
        if difficulty:
            query = query.where(ClassTypeModel.difficulty == difficulty)

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
        if class_type_id <= 0:
            raise BadRequestError("Invalid class type ID")

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
        # Validate name
        if not payload.name or not payload.name.strip():
            raise BadRequestError("Class type name is required")

        if len(payload.name) < 2:
            raise BadRequestError("Class type name must be at least 2 characters")

        if len(payload.name) > 32:
            raise BadRequestError("Class type name cannot exceed 32 characters")

        if not payload.name.replace(" ", "").isalnum():
            raise BadRequestError("Class type name can only contain letters, numbers and spaces")

        # Validate difficulty
        if payload.difficulty < 1 or payload.difficulty > 5:
            raise BadRequestError("Difficulty must be between 1 and 5")


        new_class_type = ClassTypeModel(
            name=payload.name.strip(),
            difficulty=payload.difficulty
        )
        db.add(new_class_type)
        await db.commit()
        await db.refresh(new_class_type)

        return {
            "status": "SUCCEEDED",
            "data": ClassTypeSchema.model_validate(new_class_type),
            "message": "Class type created successfully"
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
        if class_type_id <= 0:
            raise BadRequestError("Invalid class type ID")

        class_type = await db.get(ClassTypeModel, class_type_id)
        if not class_type:
            raise NotFoundError(resource="ClassType", id=class_type_id)

        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise BadRequestError("No fields provided for update")

        # Validate name if being updated
        if "name" in update_data:
            if not update_data["name"] or not update_data["name"].strip():
                raise BadRequestError("Class type name cannot be empty")

            if len(update_data["name"]) < 2:
                raise BadRequestError("Class type name must be at least 2 characters")

            if len(update_data["name"]) > 32:
                raise BadRequestError("Class type name cannot exceed 32 characters")

            if not update_data["name"].replace(" ", "").isalnum():
                raise BadRequestError("Class type name can only contain letters, numbers and spaces")

            # Check for duplicate name (excluding current)
            existing = await db.execute(
                select(ClassTypeModel)
                .where(ClassTypeModel.name.ilike(update_data["name"]))
                .where(ClassTypeModel.class_type_id != class_type_id)
            )
            if existing.scalar_one_or_none():
                raise BadRequestError(f"Class type with name '{update_data['name']}' already exists")

            update_data["name"] = update_data["name"].strip()

        # Validate difficulty if being updated
        if "difficulty" in update_data:
            if update_data["difficulty"] < 1 or update_data["difficulty"] > 5:
                raise BadRequestError("Difficulty must be between 1 and 5")

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
        if class_type_id <= 0:
            raise BadRequestError("Invalid class type ID")

        class_type = await db.get(ClassTypeModel, class_type_id)
        if not class_type:
            raise NotFoundError(resource="ClassType", id=class_type_id)

        # Check if class type is being used by any classes
        classes_using = await db.execute(
            select(ClassModel).where(ClassModel.class_type_id == class_type_id)
        )
        if classes_using.scalar_one_or_none():
            raise BadRequestError(
                f"Cannot delete class type '{class_type.name}' because it is being used by existing classes. "
                "Remove or reassign those classes first."
            )

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