from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models import Room as RoomModel, Gym as GymModel
from ..schemas import RoomSchema, ApiResponse, RoomCreate, RoomUpdate
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

@router.post("/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    payload: RoomCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        gym = await db.get(GymModel, payload.gym_id)
        if not gym:
            raise NotFoundError(resource="Gym")

        new_room = RoomModel(**payload.model_dump())
        db.add(new_room)
        await db.commit()
        await db.refresh(new_room)

        return {
            "status": "SUCCEEDED",
            "data": RoomSchema.model_validate(new_room),
            "message": "Room created successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="create_room")

@router.patch("/{room_id}", response_model=ApiResponse)
async def update_room(
    room_id: int,
    payload: RoomUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        room = await db.get(RoomModel, room_id)

        if not room:
            raise NotFoundError(resource="Room", id=room_id)

        update_data = payload.model_dump(exclude_unset=True)

        if "gym_id" in update_data:
            gym = await db.get(GymModel, update_data["gym_id"])
            if not gym:
                raise NotFoundError(resource="gym")

        for key, value in update_data.items():
            setattr(room, key, value)

        await db.commit()
        await db.refresh(room)

        return {
            "status": "SUCCEEDED",
            "data": RoomSchema.model_validate(room),
            "message": "Room updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_room")

@router.delete("/{room_id}", response_model=ApiResponse)
async def delete_room(room_id: int, db: AsyncSession = Depends(get_db)):
    try:
        room = await db.get(RoomModel, room_id)
        if not room:
            raise NotFoundError(resource="Room", id=room_id)

        await db.delete(room)
        await db.commit()

        return {
            "status": "SUCCEEDED",
            "data": None,
            "message": "Room deleted successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="delete_room")