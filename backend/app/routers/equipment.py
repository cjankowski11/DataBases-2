from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from ..database import get_db
from ..models import Equipment as EquipmentModel, Weight as WeightModel, Machine as MachineModel, Accessory as AccessoryModel
from ..schemas import EquipmentUnion, ApiResponse, WeightSchema, MachineSchema, AccessorySchema, EquipmentSchema
from ..utils.error_handle import handle_error, NotFoundError


router = APIRouter(
    prefix="/equipment",
    tags=["equipment"]
)

@router.get("/", response_model=ApiResponse)
async def get_equipment(db: AsyncSession = Depends(get_db)):
    try:
        # Polymorphic select
        query = select(EquipmentModel).options(joinedload(EquipmentModel.gym))
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
        query = select(EquipmentModel).where(EquipmentModel.equipment_id == equipment_id).options(joinedload(EquipmentModel.gym))
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
