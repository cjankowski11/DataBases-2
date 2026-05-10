from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models import Room as RoomModel
from ..schemas import RoomSchema, ApiResponse
from ..utils.error_handle import handle_error, NotFoundError


router = APIRouter(
    prefix="/rooms",
    tags=["rooms"]
)

@router.get("/", response_model=ApiResponse)
async def get_rooms(db: AsyncSession = Depends(get_db)):
    try:
        query = select(RoomModel)
        result = await db.execute(query)
        rooms = result.scalars().all()

        validated_rooms = [RoomSchema.model_validate(r) for r in rooms]

        return {
            "status": "SUCCEEDED",
            "data": validated_rooms,
            "message": "Rooms retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_rooms")

@router.get("/{room_id}", response_model=ApiResponse)
async def get_room(room_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = select(RoomModel).where(RoomModel.room_id == room_id)
        result = await db.execute(query)
        room_db = result.scalar_one_or_none()

        if not room_db:
            raise NotFoundError(resource="Room", id=room_id)

        return {
            "status": "SUCCEEDED",
            "data": RoomSchema.model_validate(room_db),
            "message": "Room found"
        }
    except Exception as e:
        return handle_error(e, context="get_room")