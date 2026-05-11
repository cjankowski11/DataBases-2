from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import date

class ApiResponse(BaseModel):
    status: str  # "SUCCEEDED" or "FAILED"
    data: Optional[Any] = None
    message: Optional[str] = None


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
    birth_date: date

    model_config = {"from_attributes": True}


class ClassRegistrationSchema(BaseModel):
    class_registration_id: int
    client_id: int
    class_id: int
    registration_date: date

    client: Optional[ClientSchema] = None
    class_info: Optional[ClassSchema] = None

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