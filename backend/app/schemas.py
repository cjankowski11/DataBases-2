from pydantic import BaseModel
from typing import List, Optional, Any, Union, Literal
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
    occupancy_pct: float = 0.0

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

class EmployeeBase(BaseModel):
    name: str
    surname: str
    gender: Literal["M", "F"]
    date_employed: Optional[date] = None
    salary: Optional[Decimal] = None


class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(EmployeeBase):
    name: Optional[str] = None
    surname: Optional[str] = None
    gender: Optional[Literal["M", "F"]] = None
    is_employed: Optional[bool] = None

class EmployeeSchema(EmployeeBase):
    employee_id: int
    is_employed: bool

    model_config = {"from_attributes": True}

class ReceptionistBase(BaseModel):
    shift: Optional[str] = None

class ReceptionistSchema(EmployeeSchema, ReceptionistBase):
    model_config = {"from_attributes": True}

class TrainerBase(BaseModel):
    specialization: str
    hourly_wage: Decimal

class TrainerSchema(EmployeeSchema, TrainerBase):
    model_config = {"from_attributes": True}

class GymEmployeeBase(BaseModel):
    gym_id: int
    employee_id: int

class GymEmployeeSchema(GymEmployeeBase):
    model_config = {"from_attributes": True}

class TrainerClassBase(BaseModel):
    employee_id: int
    class_id: int

class TrainerClassSchema(TrainerClassBase):
    model_config = {"from_attributes": True}

class PersonalTrainingBase(BaseModel):
    client_id: int
    trainer_id: int
    start_time: datetime
    duration: int

class PersonalTrainingSchema(PersonalTrainingBase):
    personal_training_id: int

    client: Optional[ClientSchema] = None
    trainer: Optional[TrainerSchema] = None

    model_config = {"from_attributes": True}

class ArticleBase(BaseModel):
    name: str
    price: float
    type: str
    stock: int

class ArticleCreate(ArticleBase):
    pass

class ArticleSchema(ArticleBase):
    article_id: int

    model_config = {"from_attributes": True}


class StocktakingBase(BaseModel):
    gym_id: int
    stocktaking_date: date

class StocktakingCreate(StocktakingBase):
    pass

class StocktakingSchema(StocktakingBase):
    stocktaking_id: int

    model_config = {"from_attributes": True}


class TransactionArticleCreate(BaseModel):
    article_id: int
    quantity: int

class TransactionArticleSchema(BaseModel):
    transaction_client_id: int
    article_id: int
    quantity: Optional[int] = None
    article: Optional[ArticleSchema] = None

    model_config = {"from_attributes": True}


class TransactionClientCreate(BaseModel):
    client_id: int
    receptionist_employee_id: int
    transaction_date: date
    articles: List[TransactionArticleCreate]

class TransactionClientSchema(BaseModel):
    transaction_client_id: int
    client_id: int
    receptionist_employee_id: int
    transaction_date: date
    articles: List[TransactionArticleSchema] = []

    model_config = {"from_attributes": True}


class ArticleBase(BaseModel):
    name: str
    price: float
    type: str
    stock: int

class ArticleCreate(ArticleBase):
    pass

class ArticleSchema(ArticleBase):
    article_id: int

    model_config = {"from_attributes": True}


class StocktakingBase(BaseModel):
    gym_id: int
    stocktaking_date: date

class StocktakingCreate(StocktakingBase):
    pass

class StocktakingSchema(StocktakingBase):
    stocktaking_id: int

    model_config = {"from_attributes": True}


class TransactionArticleCreate(BaseModel):
    article_id: int
    quantity: int

class TransactionArticleSchema(BaseModel):
    transaction_client_id: int
    article_id: int
    quantity: Optional[int] = None
    article: Optional[ArticleSchema] = None

    model_config = {"from_attributes": True}


class TransactionClientCreate(BaseModel):
    client_id: int
    receptionist_employee_id: int
    transaction_date: date
    articles: List[TransactionArticleCreate]

class TransactionClientSchema(BaseModel):
    transaction_client_id: int
    client_id: int
    receptionist_employee_id: int
    transaction_date: date
    articles: List[TransactionArticleSchema] = []

    model_config = {"from_attributes": True}


class AddressBase(BaseModel):
    city: str
    street: str
    building_number: int
    postal_code: str

class AddressCreate(AddressBase):
    pass

class AddressSchema(AddressBase):
    address_id: int

    model_config = {"from_attributes": True}


class GymBase(BaseModel):
    name: str
    established: date
    email: Optional[str] = None
    phone: Optional[str] = None
    area: Optional[int] = None
    open_hour: Optional[time] = None
    close_hour: Optional[time] = None
    address_id: int

class GymCreate(GymBase):
    pass

class GymSchema(GymBase):
    gym_id: int
    address: Optional[AddressSchema] = None

    model_config = {"from_attributes": True}


class SponsorBase(BaseModel):
    name: str

class SponsorCreate(SponsorBase):
    pass

class SponsorSchema(SponsorBase):
    sponsor_id: int

    model_config = {"from_attributes": True}


class ContractBase(BaseModel):
    gym_id: int
    sponsor_id: int
    payment: Decimal
    contract_date: date
    expiration_date: date

class ContractCreate(ContractBase):
    pass

class ContractSchema(ContractBase):
    contract_id: int
    gym: Optional[GymSchema] = None
    sponsor: Optional[SponsorSchema] = None

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

##Post

class EquipmentCreate(BaseModel):

    serial_number: int
    gym_id: Optional[int] = None
    producer: str
    name: str
    state: str
    date_bought: date
    date_produced: date
    price: Decimal
    equipment_type: str

class WeightCreate(EquipmentCreate):
    weight: Decimal
    type: str
    material: str

class MachineCreate(EquipmentCreate):
    max_weight: int
    bodypart_target: str

class AccessoryCreate(EquipmentCreate):
    type: str


class EntryCreate(BaseModel):

    client_id: int
    gym_id: int
    entry_time: datetime

class SubscriptionCreate(BaseModel):
    name: str
    price: Decimal
    duration: int
    entry_until: Optional[date] = None


class ClientSubscriptionCreate(BaseModel):

    client_id: int
    receptionist_employee_id: Optional[int] = None
    subscription_id: int
    transaction_date: date
    paid_now: str
    expiration_date: date




