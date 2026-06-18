from pydantic import BaseModel, field_validator
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
    gym: Optional[GymSchema] = None

    model_config = {"from_attributes": True}

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    gym_id: Optional[int] = None

class ClassTypeBase(BaseModel):
    name: str
    difficulty: int

class ClassTypeSchema(ClassTypeBase):
    class_type_id: int
    model_config = {"from_attributes": True}

class ClassTypeCreate(ClassTypeBase):
    pass

class ClassTypeUpdate(BaseModel):
    name: Optional[str] = None
    difficulty: Optional[int] = None

class ClassBase(BaseModel):
    class_date: date
    class_type_id: int
    duration: int
    capacity: int
    room_id: int

class ClassSchema(ClassBase):
    class_id: int

    occupancy_pct: float = 0.0

    class_type: Optional[ClassTypeSchema] = None
    room: Optional[RoomSchema] = None

    trainers: List["TrainerSchema"] = []

    model_config = {"from_attributes": True}

class ClassCreate(ClassBase):
    trainer_ids: Optional[List[int]] = []


class ClassUpdate(BaseModel):
    class_date: Optional[date] = None
    class_type_id: Optional[int] = None
    duration: Optional[int] = None
    capacity: Optional[int] = None
    room_id: Optional[int] = None
    trainer_ids: Optional[List[int]] = None

class ClientBase(BaseModel):
    name: str
    surname: str
    email: str
    phone: str
    birth_date: Optional[date] = None

class ClientSchema(ClientBase):
    client_id: int

    model_config = {"from_attributes": True}

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[date] = None

class ClassRegistrationBase(BaseModel):
    client_id: int
    class_id: int
    registration_date: date

class ClassRegistrationSchema(ClassRegistrationBase):
    class_registration_id: int

    client: Optional[ClientSchema] = None
    class_info: Optional[ClassSchema] = None

    model_config = {"from_attributes": True}

class ClassRegistrationCreate(ClassRegistrationBase):
    pass

class ClassRegistrationUpdate(BaseModel):
    client_id: Optional[int] = None
    class_id: Optional[int] = None
    registration_date: Optional[date] = None

class EmployeeBase(BaseModel):
    name: str
    surname: str
    gender: Literal["M", "F"]
    date_employed: Optional[date] = None
    salary: Optional[Decimal] = None
    def empty_salary_to_none(cls, v):
        if v == "":
            return None
        return v


class EmployeeCreate(EmployeeBase):
    date_employed: date
    birth_date: Optional[date] = None
    @field_validator('birth_date', mode='before')
    def empty_date_to_none(cls, v):
        if v == "":
            return None
        return v

class EmployeeUpdate(EmployeeBase):
    name: Optional[str] = None
    surname: Optional[str] = None
    gender: Optional[Literal["M", "F"]] = None
    is_employed: Optional[bool] = None
    birth_date: Optional[date] = None

class EmployeeSchema(EmployeeBase):
    employee_id: int
    is_employed: bool
    employee_type: str
    birth_date: Optional[date] = None
    model_config = {"from_attributes": True}

class ReceptionistBase(BaseModel):
    shift: Optional[str] = None

class ReceptionistSchema(EmployeeSchema, ReceptionistBase):
    model_config = {"from_attributes": True}

class ReceptionistCreate(EmployeeCreate):
    shift: str

class ReceptionistUpdate(EmployeeUpdate, ReceptionistBase):
    pass

class TrainerBase(BaseModel):
    specialization: str
    hourly_wage: Decimal

class TrainerSchema(EmployeeSchema, TrainerBase):
    model_config = {"from_attributes": True}

class TrainerCreate(EmployeeCreate, TrainerBase):
    pass

class TrainerUpdate(EmployeeUpdate):
    specialization: Optional[str] = None
    hourly_wage: Optional[Decimal] = None

EmployeeUnion = Union[EmployeeSchema, ReceptionistSchema, TrainerSchema]


class GymEmployeeBase(BaseModel):
    gym_id: int
    employee_id: int

class GymEmployeeSchema(GymEmployeeBase):
    model_config = {"from_attributes": True}

class GymEmployeeCreate(GymEmployeeBase):
    pass

class GymEmployeeUpdate(BaseModel):
    gym_id: Optional[int] = None
    employee_id: Optional[int] = None


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

class PersonalTrainingCreate(PersonalTrainingBase):
    pass

class PersonalTrainingUpdate(PersonalTrainingBase):
    client_id: Optional[int] = None
    trainer_id: Optional[int] = None
    start_time: Optional[datetime] = None
    duration: Optional[int] = None

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

class ArticleUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    type: Optional[str] = None
    stock: Optional[int] = None


class StocktakingBase(BaseModel):
    gym_id: int
    stocktaking_date: date

class StocktakingCreate(StocktakingBase):
    pass

class StocktakingSchema(StocktakingBase):
    stocktaking_id: int

    model_config = {"from_attributes": True}

class StocktakingUpdate(BaseModel):
    gym_id: Optional[int] = None
    stocktaking_date: Optional[date] = None


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

class TransactionClientUpdate(BaseModel):
    client_id: Optional[int] = None
    receptionist_employee_id: Optional[int] = None
    transaction_date: Optional[date] = None
    articles: Optional[List[TransactionArticleCreate]] = None




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

class EquipmentUpdate(BaseModel):
    serial_number: Optional[int] = None
    gym_id: Optional[int] = None
    producer: Optional[str] = None
    name: Optional[str] = None
    state: Optional[str] = None
    date_bought: Optional[date] = None
    date_produced: Optional[date] = None
    price: Optional[Decimal] = None
    equipment_type: Optional[str] = None

class WeightUpdate(EquipmentUpdate):
    weight: Optional[Decimal] = None
    type: Optional[str] = None
    material: Optional[str] = None

class MachineUpdate(EquipmentUpdate):
    max_weight: Optional[int] = None
    bodypart_target: Optional[str] = None

class AccessoryUpdate(EquipmentUpdate):
    type: Optional[str] = None

class EntryUpdate(BaseModel):
    client_id: Optional[int] = None
    gym_id: Optional[int] = None
    entry_time: Optional[datetime] = None

class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[Decimal] = None
    duration: Optional[int] = None
    entry_until: Optional[date] = None

class ClientSubscriptionUpdate(BaseModel):
    client_id: Optional[int] = None
    receptionist_employee_id: Optional[int] = None
    subscription_id: Optional[int] = None
    transaction_date: Optional[date] = None
    paid_now: Optional[str] = None
    expiration_date: Optional[date] = None

class ContractUpdate(BaseModel):
    payment: Optional[Decimal] = None
    expiration_date: Optional[date] = None

class GymUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    area: Optional[int] = None
    open_hour: Optional[time] = None
    close_hour: Optional[time] = None
    address_id: Optional[int] = None


ClassSchema.model_rebuild()