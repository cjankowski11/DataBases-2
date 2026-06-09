from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload, with_polymorphic
from typing import Optional, List
from datetime import date
from decimal import Decimal

from ..database import get_db
from ..models import (
    Employee as EmployeeModel,
    Trainer as TrainerModel,
    Receptionist as ReceptionistModel
)
from ..schemas import (
    ApiResponse, 
    EmployeeSchema, 
    TrainerSchema, 
    ReceptionistSchema
)
from ..utils.error_handle import handle_error, NotFoundError

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
    min_salary: Optional[Decimal] = Query(None),
    from_date_employed: Optional[date] = Query(None)
):
    try:
        # 1. Definiujemy polimorfizm dla pracowników
        poly = with_polymorphic(EmployeeModel, [TrainerModel, ReceptionistModel])
        query = select(poly)

        # 2. Dynamiczne filtry
        filters = []
        if name:
            filters.append(poly.name.ilike(f"%{name}%"))
        if surname:
            filters.append(poly.surname.ilike(f"%{surname}%"))
        if is_employed is not None:
            filters.append(poly.is_employed == is_employed)
        if gender:
            filters.append(poly.gender == gender)
        if min_salary:
            filters.append(poly.salary >= min_salary)
        if from_date_employed:
            filters.append(poly.date_employed >= from_date_employed)

        if filters:
            query = query.where(and_(*filters))

        query = query.order_by(poly.surname, poly.name)

        result = await db.execute(query)
        # Przy polimorfizmie zawsze warto użyć .unique() przed .all()
        employees_list = result.scalars().unique().all()

        # 3. Walidacja za pomocą isinstance na wzór Twojego kodu
        validated_data = []
        for e in employees_list:
            if isinstance(e, TrainerModel):
                validated_data.append(TrainerSchema.model_validate(e))
            elif isinstance(e, ReceptionistModel):
                validated_data.append(ReceptionistSchema.model_validate(e))
            else:
                validated_data.append(EmployeeSchema.model_validate(e))

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
        poly = with_polymorphic(EmployeeModel, [TrainerModel, ReceptionistModel])
        query = select(poly).where(poly.employee_id == employee_id)
        
        result = await db.execute(query)
        e = result.scalars().unique().one_or_none()

        if not e:
            raise NotFoundError(resource="Employee", id=employee_id)

        # Walidacja pojedynczego obiektu przez isinstance
        if isinstance(e, TrainerModel):
            data = TrainerSchema.model_validate(e)
        elif isinstance(e, ReceptionistModel):
            data = ReceptionistSchema.model_validate(e)
        else:
            data = EmployeeSchema.model_validate(e)

        return {
            "status": "SUCCEEDED",
            "data": data,
            "message": "Employee found"
        }
    except Exception as e:
        return handle_error(e, context="get_employee")