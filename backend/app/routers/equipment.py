from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload, with_polymorphic

from ..database import get_db
from ..models import (
    Equipment as EquipmentModel,
    Weight as WeightModel,
    Machine as MachineModel,
    Accessory as AccessoryModel,
    Gym as GymModel,
    Address as AddressModel
    )
from ..schemas import EquipmentUnion, ApiResponse, WeightSchema, MachineSchema, AccessorySchema, EquipmentSchema, WeightCreate, MachineCreate, AccessoryCreate, WeightUpdate, MachineUpdate, AccessoryUpdate
from ..utils.error_handle import handle_error, NotFoundError


router = APIRouter(
    prefix="/equipment",
    tags=["equipment"]
)

def _validate_equipment(eq) -> EquipmentUnion:
    if isinstance(eq, WeightModel):
        return WeightSchema.model_validate(eq)
    elif isinstance(eq, MachineModel):
        return MachineSchema.model_validate(eq)
    elif isinstance(eq, AccessoryModel):
        return AccessorySchema.model_validate(eq)
    return EquipmentSchema.model_validate(eq)


async def _fetch_one_full(db: AsyncSession, equipment_id: int) -> EquipmentUnion:
    poly = with_polymorphic(EquipmentModel, [WeightModel, MachineModel, AccessoryModel])
    query = (
        select(poly)
        .where(EquipmentModel.equipment_id == equipment_id)
        .options(joinedload(poly.gym).joinedload(GymModel.address))
    )
    result = await db.execute(query)
    return result.scalar_one()


@router.get("/", response_model=ApiResponse)
async def get_equipment(db: AsyncSession = Depends(get_db)):
    try:
        poly = with_polymorphic(EquipmentModel, [WeightModel,MachineModel,AccessoryModel])
        query = select(poly).order_by(poly.equipment_id.desc()).options(joinedload(poly.gym).joinedload(GymModel.address))
        result = await db.execute(query)
        equipment_list = result.scalars().all()

        validated_data = []
        for eq in equipment_list:
            if isinstance(eq, WeightModel):
                validated_data.append(WeightSchema.model_validate(eq))
            elif isinstance(eq, MachineModel):
                validated_data.append(MachineSchema.model_validate(eq))
            elif isinstance(eq, AccessoryModel):
                validated_data.append(AccessorySchema.model_validate(eq))
            else:
                validated_data.append(EquipmentSchema.model_validate(eq))

        return {
            "status": "SUCCEEDED",
            "data": validated_data,
            "message": "Equipment retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_equipment")

@router.get("/{equipment_id}", response_model=ApiResponse)
async def get_equipment_item(equipment_id: int, db: AsyncSession = Depends(get_db)):
    try:
        poly = with_polymorphic(EquipmentModel, [WeightModel,MachineModel,AccessoryModel])
        query = select(poly).where(EquipmentModel.equipment_id == equipment_id).options(joinedload(poly.gym).joinedload(GymModel.address))
        result = await db.execute(query)
        eq = result.scalar_one_or_none()

        if not eq:
            raise NotFoundError(resource="Equipment", id=equipment_id)

        if isinstance(eq, WeightModel):
            data = WeightSchema.model_validate(eq)
        elif isinstance(eq, MachineModel):
            data = MachineSchema.model_validate(eq)
        elif isinstance(eq, AccessoryModel):
            data = AccessorySchema.model_validate(eq)
        else:
            data = EquipmentSchema.model_validate(eq)

        return {
            "status": "SUCCEEDED",
            "data": data,
            "message": "Equipment item found"
        }
    except Exception as e:
        return handle_error(e, context="get_equipment_item")

@router.post("/weights",response_model=ApiResponse, status_code=201)
async def create_weight(
    payload: WeightCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        if payload.gym_id:
            gym = await db.get(GymModel, payload.gym_id)
            if not gym:
                raise NotFoundError(resource="Gym", id=payload.gym_id)
        new_eq = WeightModel(**payload.model_dump())
        db.add(new_eq)
        await db.commit()
        await db.refresh(new_eq)

        full = await _fetch_one_full(db, new_eq.equipment_id)
        return {
            "status": "SUCCEEDED",
            "data": WeightSchema.model_validate(full),
            "message": "Weight created successfully"
        }
    except Exception as e:
        return handle_error(e, context="create_weight")

@router.post("/machines", response_model=ApiResponse, status_code=201)
async def create_machine(
    payload: MachineCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        if payload.gym_id:
            gym = await db.get(GymModel, payload.gym_id)
            if not gym:
                raise NotFoundError(resource="Gym", id=payload.gym_id)

        new_eq = MachineModel(**payload.model_dump())
        db.add(new_eq)
        await db.commit()
        await db.refresh(new_eq)

        full = await _fetch_one_full(db, new_eq.equipment_id)
        return {
            "status": "SUCCEEDED",
            "data": MachineSchema.model_validate(full),
            "message": "Machine created successfully"
        }
    except Exception as e:
        return handle_error(e, context="create_machine")

@router.post("/accessories", response_model=ApiResponse, status_code=201)
async def create_accessory(
    payload: AccessoryCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        if payload.gym_id:
            gym = await db.get(GymModel, payload.gym_id)
            if not gym:
                raise NotFoundError(resource="Gym", id=payload.gym_id)

        new_eq = AccessoryModel(**payload.model_dump())
        db.add(new_eq)
        await db.commit()
        await db.refresh(new_eq)

        full = await _fetch_one_full(db, new_eq.equipment_id)
        return {
            "status": "SUCCEEDED",
            "data": AccessorySchema.model_validate(full),
            "message": "Accessory created successfully"
        }
    except Exception as e:
        return handle_error(e, context="create_accessory")

@router.patch("/weights/{equipment_id}", response_model=ApiResponse)
async def update_weight(
    equipment_id: int,
    payload: WeightUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        eq = await db.get(WeightModel, equipment_id)
        if not eq:
            raise NotFoundError(resource="Weight", id=equipment_id)

        update_data = payload.model_dump(exclude_unset=True)
        if "gym_id" in update_data and update_data["gym_id"] is not None:
            gym = await db.get(GymModel, update_data["gym_id"])
            if not gym:
                raise NotFoundError(resource="Gym", id=update_data["gym_id"])

        for key, value in update_data.items():
            setattr(eq, key, value)

        await db.commit()
        await db.refresh(eq)
        full = await _fetch_one_full(db, eq.equipment_id)

        return {
            "status": "SUCCEEDED",
            "data": WeightSchema.model_validate(full),
            "message": "Weight updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_weight")

@router.patch("/machines/{equipment_id}", response_model=ApiResponse)
async def update_machine(
    equipment_id: int,
    payload: MachineUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        eq = await db.get(MachineModel, equipment_id)
        if not eq:
            raise NotFoundError(resource="Machine", id=equipment_id)

        update_data = payload.model_dump(exclude_unset=True)
        if "gym_id" in update_data and update_data["gym_id"] is not None:
            gym = await db.get(GymModel, update_data["gym_id"])
            if not gym:
                raise NotFoundError(resource="Gym", id=update_data["gym_id"])

        for key, value in update_data.items():
            setattr(eq, key, value)

        await db.commit()
        await db.refresh(eq)
        full = await _fetch_one_full(db, eq.equipment_id)

        return {
            "status": "SUCCEEDED",
            "data": MachineSchema.model_validate(full),
            "message": "Machine updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_machine")

@router.patch("/accessories/{equipment_id}", response_model=ApiResponse)
async def update_accessory(
    equipment_id: int,
    payload: AccessoryUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        eq = await db.get(AccessoryModel, equipment_id)
        if not eq:
            raise NotFoundError(resource="Accessory", id=equipment_id)

        update_data = payload.model_dump(exclude_unset=True)
        if "gym_id" in update_data and update_data["gym_id"] is not None:
            gym = await db.get(GymModel, update_data["gym_id"])
            if not gym:
                raise NotFoundError(resource="Gym", id=update_data["gym_id"])

        for key, value in update_data.items():
            setattr(eq, key, value)

        await db.commit()
        await db.refresh(eq)
        full = await _fetch_one_full(db, eq.equipment_id)

        return {
            "status": "SUCCEEDED",
            "data": AccessorySchema.model_validate(full),
            "message": "Accessory updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_accessory")

@router.delete("/{equipment_id}", response_model=ApiResponse)
async def delete_equipment(equipment_id: int, db: AsyncSession = Depends(get_db)):
    try:
        eq = await db.get(EquipmentModel, equipment_id)
        if not eq:
            raise NotFoundError(resource="Equipment", id=equipment_id)
        
        await db.delete(eq)
        await db.commit()
        
        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Equipment deleted successfully"
        }
    except Exception as e:
        return handle_error(e, context="delete_equipment")

