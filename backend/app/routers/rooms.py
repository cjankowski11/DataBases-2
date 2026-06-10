from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from typing import Optional

from ..database import get_db
from ..models import Room as RoomModel, Gym as GymModel, Class as ClassModel
from ..schemas import RoomSchema, ApiResponse, RoomCreate, RoomUpdate
from ..utils.error_handle import handle_error, NotFoundError, BadRequestError


router = APIRouter(
    prefix="/rooms",
    tags=["rooms"]
)

@router.get("/", response_model=ApiResponse)
async def get_rooms(
    db: AsyncSession = Depends(get_db),
    gym_id: Optional[int] = Query(None, gt=0),
    name: Optional[str] = Query(None, min_length=1, max_length=64)
):
    try:
        query = (
            select(RoomModel)
            .options(joinedload(RoomModel.gym))
        )

        if gym_id:
            query = query.where(RoomModel.gym_id == gym_id)
        if name:
            query = query.where(RoomModel.name.ilike(f"%{name}%"))

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
        if room_id <= 0:
            raise BadRequestError("Invalid room ID")

        query = (
            select(RoomModel)
            .options(joinedload(RoomModel.gym))
        ).where(RoomModel.room_id == room_id)
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
        # Validate name
        if not payload.name or not payload.name.strip():
            raise BadRequestError("Room name is required")

        if len(payload.name) < 2:
            raise BadRequestError("Room name must be at least 2 characters")

        if len(payload.name) > 64:
            raise BadRequestError("Room name cannot exceed 64 characters")

        if not payload.name.replace(" ", "").replace("-", "").replace("_", "").isalnum():
            raise BadRequestError("Room name can only contain letters, numbers, spaces, hyphens, and underscores")

        # Validate gym exists
        if payload.gym_id <= 0:
            raise BadRequestError("Invalid gym ID")

        gym = await db.get(GymModel, payload.gym_id)
        if not gym:
            raise NotFoundError(resource="Gym", id=payload.gym_id)

        # Check for duplicate room name in same gym
        existing = await db.execute(
            select(RoomModel)
            .where(RoomModel.gym_id == payload.gym_id)
            .where(RoomModel.name.ilike(payload.name.strip()))
        )
        if existing.scalar_one_or_none():
            raise BadRequestError(f"Room '{payload.name}' already exists in this gym")

        new_room = RoomModel(
            name=payload.name.strip(),
            gym_id=payload.gym_id
        )
        db.add(new_room)
        await db.commit()
        await db.refresh(new_room)

        # Refresh with joinedload
        query = (
            select(RoomModel)
            .options(joinedload(RoomModel.gym))
            .where(RoomModel.room_id == new_room.room_id)
        )
        result = await db.execute(query)
        new_room_with_gym = result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": RoomSchema.model_validate(new_room_with_gym),
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
        if room_id <= 0:
            raise BadRequestError("Invalid room ID")

        room = await db.get(RoomModel, room_id)
        if not room:
            raise NotFoundError(resource="Room", id=room_id)

        update_data = payload.model_dump(exclude_unset=True)
        if not update_data:
            raise BadRequestError("No fields provided for update")

        # Validate name if being updated
        if "name" in update_data:
            if not update_data["name"] or not update_data["name"].strip():
                raise BadRequestError("Room name cannot be empty")

            if len(update_data["name"]) < 2:
                raise BadRequestError("Room name must be at least 2 characters")

            if len(update_data["name"]) > 64:
                raise BadRequestError("Room name cannot exceed 64 characters")

            if not update_data["name"].replace(" ", "").replace("-", "").replace("_", "").isalnum():
                raise BadRequestError("Room name can only contain letters, numbers, spaces, hyphens, and underscores")

            # Check for duplicate name in same gym (excluding current room)
            target_gym_id = update_data.get("gym_id", room.gym_id)
            existing = await db.execute(
                select(RoomModel)
                .where(RoomModel.gym_id == target_gym_id)
                .where(RoomModel.name.ilike(update_data["name"].strip()))
                .where(RoomModel.room_id != room_id)
            )
            if existing.scalar_one_or_none():
                raise BadRequestError(f"Room '{update_data['name']}' already exists in this gym")

            update_data["name"] = update_data["name"].strip()

        # Validate gym_id if being updated
        if "gym_id" in update_data:
            if update_data["gym_id"] <= 0:
                raise BadRequestError("Invalid gym ID")

            gym = await db.get(GymModel, update_data["gym_id"])
            if not gym:
                raise NotFoundError(resource="Gym", id=update_data["gym_id"])

            # If changing gym, check for duplicate name in new gym

            new_name = update_data.get("name", room.name)
            existing = await db.execute(
                select(RoomModel)
                .where(RoomModel.gym_id == update_data["gym_id"])
                .where(RoomModel.name.ilike(new_name))
                .where(RoomModel.room_id != room_id)
            )
            if existing.scalar_one_or_none():
                raise BadRequestError(f"Room '{new_name}' already exists in the target gym")

        for key, value in update_data.items():
            setattr(room, key, value)

        await db.commit()

        # Refresh with joinedload
        query = (
            select(RoomModel)
            .options(joinedload(RoomModel.gym))
            .where(RoomModel.room_id == room_id)
        )
        result = await db.execute(query)
        room_with_gym = result.scalar_one()

        return {
            "status": "SUCCEEDED",
            "data": RoomSchema.model_validate(room_with_gym),
            "message": "Room updated successfully"
        }
    except Exception as e:
        await db.rollback()
        return handle_error(e, context="update_room")

@router.delete("/{room_id}", response_model=ApiResponse)
async def delete_room(room_id: int, db: AsyncSession = Depends(get_db)):
    try:
        if room_id <= 0:
            raise BadRequestError("Invalid room ID")

        room = await db.get(RoomModel, room_id)
        if not room:
            raise NotFoundError(resource="Room", id=room_id)

        # Check if room is being used by any classes
        classes_using = await db.execute(
            select(ClassModel).where(ClassModel.room_id == room_id)
        )
        if classes_using.scalar_one_or_none():
            raise BadRequestError(
                f"Cannot delete room '{room.name}' because it has scheduled classes. "
                "Reassign or cancel those classes first."
            )

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