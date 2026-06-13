from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import Optional

from ..database import get_db
from ..models import GymEmployee as GymEmployeeModel  # Upewnij się, że tak nazywa się model w SQLAlchemii
from ..schemas import ApiResponse, GymEmployeeSchema, GymEmployeeCreate
from ..utils.error_handle import handle_error, NotFoundError

router = APIRouter(
    prefix="/gym-employments",
    tags=["gym-employments"]
)

@router.get("/", response_model=ApiResponse)
async def get_gym_employments(
    db: AsyncSession = Depends(get_db),
    gym_id: Optional[int] = Query(None),
    employee_id: Optional[int] = Query(None)
):
    try:
        query = select(GymEmployeeModel).options(
            selectinload(GymEmployeeModel.gym),
            selectinload(GymEmployeeModel.employee)
        )

        filters = []
        if gym_id:
            filters.append(GymEmployeeModel.gym_id == gym_id)
        if employee_id:
            filters.append(GymEmployeeModel.employee_id == employee_id)

        if filters:
            query = query.where(and_(*filters))

        result = await db.execute(query)
        employments_db = result.scalars().all()

        validated_data = [GymEmployeeSchema.model_validate(e) for e in employments_db]

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Gym employments retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_gym_employments")


@router.post("/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_gym_employment(
    payload: GymEmployeeCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        new_employment = GymEmployeeModel(
            gym_id=payload.gym_id,
            employee_id=payload.employee_id
        )

        db.add(new_employment)
        await db.commit()
        
        query = select(GymEmployeeModel).options(
            selectinload(GymEmployeeModel.gym),
            selectinload(GymEmployeeModel.employee)
        ).where(
            and_(
                GymEmployeeModel.gym_id == payload.gym_id,
                GymEmployeeModel.employee_id == payload.employee_id
            )
        )
        
        result = await db.execute(query)
        employment_with_relations = result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": GymEmployeeSchema.model_validate(employment_with_relations),
            "message": "Employee successfully assigned to the gym"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_gym_employment")


@router.get("/single", response_model=ApiResponse)
async def get_gym_employment(
    gym_id: int = Query(...),
    employee_id: int = Query(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        query = select(GymEmployeeModel).options(
            selectinload(GymEmployeeModel.gym),
            selectinload(GymEmployeeModel.employee)
        ).where(
            and_(
                GymEmployeeModel.gym_id == gym_id,
                GymEmployeeModel.employee_id == employee_id
            )
        )
        
        result = await db.execute(query)
        employment_db = result.scalar_one_or_none()

        if not employment_db:
            raise NotFoundError(resource="GymEmployment", id=f"gym_id: {gym_id}, employee_id: {employee_id}")

        return {
            "status": "SUCCEEDED",
            "data": GymEmployeeSchema.model_validate(employment_db),
            "message": "Gym employment relationship found"
        }
    except Exception as e:
        return handle_error(e, context="get_gym_employment")


@router.delete("/", response_model=ApiResponse)
async def delete_gym_employment(
    gym_id: int = Query(...),
    employee_id: int = Query(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        query = select(GymEmployeeModel).where(
            and_(
                GymEmployeeModel.gym_id == gym_id,
                GymEmployeeModel.employee_id == employee_id
            )
        )
        result = await db.execute(query)
        employment_db = result.scalar_one_or_none()

        if not employment_db:
            raise NotFoundError(resource="GymEmployment", id=f"gym_id: {gym_id}, employee_id: {employee_id}")

        await db.delete(employment_db)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": f"Employee {employee_id} has been successfully removed from gym {gym_id}"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="delete_gym_employment")