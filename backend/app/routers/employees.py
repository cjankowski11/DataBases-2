from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import joinedload, with_polymorphic
from typing import Optional, List, Union
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
    ReceptionistSchema,
    EmployeeCreate,
    ReceptionistCreate,
    TrainerCreate,
    EmployeeUpdate,
    ReceptionistUpdate,
    TrainerUpdate
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
        poly = with_polymorphic(EmployeeModel, [TrainerModel, ReceptionistModel])
        query = select(poly)

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
        employees_list = result.scalars().unique().all()

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
    
@router.post("/", response_model=ApiResponse)
async def create_general_employee(employee_in: EmployeeCreate, db: AsyncSession = Depends(get_db)):
    try:
        print(employee_in)
        result = await db.execute(select(func.max(EmployeeModel.employee_id)))
        next_id = (result.scalar() or 0) + 1
        data = employee_in.model_dump()
        data["employee_id"] = next_id
        data["employee_type"] = "employee"
        data["is_employed"] = True
        print(data)


        new_employee = EmployeeModel(**data)
        db.add(new_employee)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": EmployeeSchema.model_validate(new_employee),
            "message": "Employee created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_general_employee")


@router.post("/receptionists", response_model=ApiResponse)
async def create_receptionist(receptionist_in: ReceptionistCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(func.max(EmployeeModel.employee_id)))
        next_id = (result.scalar() or 0) + 1

        data = receptionist_in.model_dump()
        
        shift_value = data.pop("shift")
        
        data["employee_id"] = next_id
        data["employee_type"] = "receptionist"
        data["is_employed"] = True

        new_receptionist = ReceptionistModel(
            shift=shift_value,
            **data
        )
        
        db.add(new_receptionist)
        await db.commit()
        await db.refresh(new_receptionist)

        return {
            "status": "SUCCEEDED",
            "data": ReceptionistSchema.model_validate(new_receptionist),
            "message": "Receptionist created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_receptionist")


@router.post("/trainers", response_model=ApiResponse)
async def create_trainer(trainer_in: TrainerCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(func.max(EmployeeModel.employee_id)))
        next_id = (result.scalar() or 0) + 1

        data = trainer_in.model_dump()
        
        specialization_value = data.pop("specialization")
        hourly_wage_value = data.pop("hourly_wage")
        
        data["employee_id"] = next_id
        data["employee_type"] = "trainer"
        data["is_employed"] = True

        new_trainer = TrainerModel(
            specialization=specialization_value,
            hourly_wage=hourly_wage_value,
            **data
        )
        
        db.add(new_trainer)
        await db.commit()
        await db.refresh(new_trainer) 

        return {
            "status": "SUCCEEDED",
            "data": TrainerSchema.model_validate(new_trainer),
            "message": "Trainer created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_trainer")

@router.patch("/{employee_id}", response_model=ApiResponse)
async def update_employee(
    employee_id: int, 
    employee_update: Union[TrainerUpdate, ReceptionistUpdate, EmployeeUpdate], 
    db: AsyncSession = Depends(get_db)
):
    try:

        poly = with_polymorphic(EmployeeModel, [TrainerModel, ReceptionistModel])
        query = select(poly).where(poly.employee_id == employee_id)
        
        result = await db.execute(query)
        employee = result.scalars().unique().one_or_none()

        if not employee:
            raise NotFoundError(resource="Employee", id=employee_id)

        update_data = employee_update.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(employee, key, value)

        await db.commit()
        await db.refresh(employee)

        if isinstance(employee, TrainerModel):
            validated_data = TrainerSchema.model_validate(employee)
        elif isinstance(employee, ReceptionistModel):
            validated_data = ReceptionistSchema.model_validate(employee)
        else:
            validated_data = EmployeeSchema.model_validate(employee)

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Employee updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_employee")
    
@router.delete("/{employee_id}", response_model=ApiResponse)
async def delete_employee(employee_id: int, db: AsyncSession = Depends(get_db)):
    try:
        poly = with_polymorphic(EmployeeModel, [TrainerModel, ReceptionistModel])
        query = select(poly).where(poly.employee_id == employee_id)
        
        result = await db.execute(query)
        employee = result.scalars().unique().one_or_none()

        if not employee:
            raise NotFoundError(resource="Employee", id=employee_id)

        await db.delete(employee)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": f"Employee with ID {employee_id} (type: {employee.employee_type}) has been successfully deleted."
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="delete_employee")