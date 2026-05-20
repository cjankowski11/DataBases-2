from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, text
from typing import Optional
from datetime import date

from ..database import get_db
from ..models import Employee as EmployeeModel
from ..schemas import ApiResponse, EmployeeSchema
from ..utils.error_handle import handle_error, NotFoundError


from sqlalchemy import inspect


router = APIRouter(
    prefix="/employees",
    tags=["employees"]
)

@router.get("/", response_model=ApiResponse)
async def get_employees(
    db: AsyncSession = Depends(get_db),
    name: Optional[str] = Query(None, min_length=2),
    surname: Optional[str] = Query(None, min_length=2),
    is_employed: Optional[bool] = Query(None),
    gender: Optional[str] = Query(None, max_length=1),
    min_salary: Optional[float] = Query(None),
    from_date_employed: Optional[date] = Query(None)
):
    try:
        query = select(EmployeeModel)

        filters = []
        if name:
            filters.append(EmployeeModel.name.ilike(f"%{name}%"))
        if surname:
            filters.append(EmployeeModel.surname.ilike(f"%{surname}%"))
        if is_employed is not None:
            filters.append(EmployeeModel.is_employed == is_employed)
        if gender:
            filters.append(EmployeeModel.gender == gender)
        if min_salary:
            filters.append(EmployeeModel.salary >= min_salary)
        if from_date_employed:
            filters.append(EmployeeModel.date_employed >= from_date_employed)

        if filters:
            query = query.where(and_(*filters))

        # Sortowanie po nazwisku i imieniu (opcjonalnie, ale dobra praktyka)
        query = query.order_by(EmployeeModel.surname, EmployeeModel.name)

        result = await db.execute(query)
        employees_db = result.scalars().all()

        validated_data = [EmployeeSchema.model_validate(e) for e in employees_db]

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Employees retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_employees")

@router.get("/{employee_id}", response_model=ApiResponse)
async def get_employee(employee_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = select(EmployeeModel).where(EmployeeModel.employee_id == employee_id)
        
        result = await db.execute(query)
        employee_db = result.scalar_one_or_none()

        if not employee_db:
            raise NotFoundError(resource="Employee", id=employee_id)

        return {
            "status": "SUCCEEDED",
            "data": EmployeeSchema.model_validate(employee_db),
            "message": "Employee found"
        }
    except Exception as e:
        return handle_error(e, context="get_employee")


