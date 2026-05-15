from pydantic import BaseModel
from typing import List, Optional, Any, Union
from datetime import date, datetime, time
from decimal import Decimal

class ApiResponse(BaseModel):
    status: str  # "SUCCEEDED" or "FAILED"
    data: Optional[Any] = None
    message: Optional[str] = None

class GymSchema(BaseModel):
    gym_id: int
    name: str
    established: date
    email: Optional[str] = None
    phone: Optional[str] = None
    area: Optional[int] = None
    open_hour: Optional[time] = None
    close_hour: Optional[time] = None
    address_id: int

    model_config = {"from_attributes": True}

class RoomBase(BaseModel):
    name: str
    gym_id: int

class RoomCreate(RoomBase):
    pass

class RoomSchema(RoomBase):
    room_id: int


    model_config = {"from_attributes": True}

class ClassTypeSchema(BaseModel):
    class_type_id: int
    name: str
    difficulty: int

    model_config = {"from_attributes": True}

class ClassSchema(BaseModel):
    class_id: int
    class_date: date
    class_type_id: int
    duration: int
    capacity: int
    room_id: int

    class_type: Optional[ClassTypeSchema] = None
    room: Optional[RoomSchema] = None

    model_config = {"from_attributes": True}


class ClientSchema(BaseModel):
    client_id: int
    name: str
    surname: str
    email: str
    phone: str
    birth_date: Optional[date] = None

    model_config = {"from_attributes": True}


class ClassRegistrationSchema(BaseModel):
    class_registration_id: int
    client_id: int
    class_id: int
    registration_date: date

    client: Optional[ClientSchema] = None
    class_info: Optional[ClassSchema] = None

    model_config = {"from_attributes": True}

class SubscriptionSchema(BaseModel):
    subscription_id: int
    name: str
    price: Decimal
    duration: int
    entry_until: Optional[date] = None

    model_config = {"from_attributes": True}

class ClientSubscriptionSchema(BaseModel):
    client_subscription_id: int
    client_id: int
    receptionist_employee_id: Optional[int] = None
    subscription_id: int
    transaction_date: date
    paid_now: str
    expiration_date: date

    client: Optional[ClientSchema] = None
    subscription: Optional[SubscriptionSchema] = None

    model_config = {"from_attributes": True}

class EntrySchema(BaseModel):
    entry_id: int
    client_id: int
    entry_time: datetime
    gym_id: int

    client: Optional[ClientSchema] = None
    gym: Optional[GymSchema] = None

    model_config = {"from_attributes": True}

class EquipmentSchema(BaseModel):
    equipment_id: int
    serial_number: int
    gym_id: Optional[int] = None
    producer: str
    name: str
    state: str
    date_bought: date
    date_produced: date
    price: Decimal
    equipment_type: str

    gym: Optional[GymSchema] = None

    model_config = {"from_attributes": True}

class WeightSchema(EquipmentSchema):
    weight: Decimal
    type: str
    material: str

class MachineSchema(EquipmentSchema):
    max_weight: int
    bodypart_target: str

class AccessorySchema(EquipmentSchema):
    type: str

EquipmentUnion = Union[WeightSchema, MachineSchema, AccessorySchema, EquipmentSchema]