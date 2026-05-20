
from sqlalchemy import Column, Integer, String, Date, ForeignKey, func, Numeric,CHAR, DateTime, Time, Boolean
from .database import Base
from sqlalchemy.orm import relationship, column_property


class Room(Base):
    __tablename__ = "room"

    room_id = Column(Integer, primary_key=True, index=True)
    gym_id = Column(Integer, ForeignKey("gym.gym_id"), nullable=False)
    name = Column(String(64), nullable=False)

    gym = relationship("Gym")

class ClassType(Base):
    __tablename__ = "class_type"

    class_type_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(32), nullable=False)
    difficulty = Column(Integer, nullable=False)

class Class(Base):
    __tablename__ = "class"

    class_id = Column(Integer, primary_key=True, index=True)
    class_date = Column(Date, nullable=False)
    class_type_id = Column(Integer, ForeignKey("class_type.class_type_id"), nullable=False)
    duration = Column(Integer, nullable=False)
    capacity = Column(Integer, nullable=False)
    room_id = Column(Integer, ForeignKey("room.room_id"), nullable=False)
    occupancy_pct = column_property(
        func.get_class_occupancy_pct(class_id)
    )

    class_type = relationship("ClassType")
    room = relationship("Room")


class Client(Base):
    __tablename__ = "client"
    client_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(32), nullable=False)
    surname = Column(String(64), nullable=False)
    email = Column(String(64), unique=True, nullable=False)
    phone = Column(String(9), nullable=False)
    birth_date = Column(Date, nullable=True)

class ClassRegistration(Base):
    __tablename__ = "class_registration"

    class_registration_id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("client.client_id"), nullable=False)
    class_id = Column(Integer, ForeignKey("class.class_id"), nullable=False)
    registration_date = Column(Date, nullable=False)

    client = relationship("Client")
    class_info = relationship("Class")

class Employee(Base):
    __tablename__ = "employee"
    employee_id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(32), nullable=False)
    surname = Column(String(64), nullable=False)
    date_employed = Column(Date, nullable=False)
    is_employed = Column(Boolean, nullable=False, default=True)
    # is_employed = Column(CHAR(1), nullable=False)
    birth_date = Column(Date, nullable=True)
    gender = Column(CHAR(1), nullable=False)
    salary = Column(Numeric(10, 2), nullable=True)

class Receptionist(Employee):
    __tablename__ = "receptionist"
    employee_id = Column(Integer, ForeignKey("employee.employee_id"), primary_key=True)
    shift = Column(String(16), nullable=False)

class GymEmployee(Base):
    __tablename__ = "gym_employee"
    gym_id = Column(Integer, ForeignKey("gym.gym_id"), primary_key=True)
    employee_id = Column(Integer, ForeignKey("employee.employee_id"), primary_key=True)

    gym = relationship("Gym")
    employee = relationship("Employee")

class Trainer(Employee):
    __tablename__ = "trainer"
    employee_id = Column(Integer, ForeignKey("employee.employee_id"), primary_key=True)
    specialization = Column(String(64), nullable=False)
    hourly_wage = Column(Numeric(10,2), nullable=False)

class TrainerClass(Base):
    __tablename__ = "trainer_class"
    employee_id = Column(Integer, ForeignKey("employee.employee_id"), primary_key=True)
    class_id = Column(Integer, ForeignKey("class.class_id"), primary_key=True)

    employee = relationship("Employee")
    Class = relationship("Class")

class PersonalTraining(Base):
    __tablename__ = "personaltraining"
    personal_training_id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("client.client_id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False)
    trainer_id = Column(Integer, ForeignKey("employee.employee_id"), nullable=False)

    client = relationship("Client")
    trainer = relationship("Trainer")
class Subscription(Base):
    __tablename__ = "subscription"
    subscription_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    duration = Column(Integer, nullable=False)
    entry_until = Column(Date)

class ClientSubscription(Base):
    __tablename__ = "client_subscription"
    client_subscription_id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("client.client_id"), nullable=False)
    receptionist_employee_id = Column(Integer) #simple
    subscription_id = Column(Integer, ForeignKey("subscription.subscription_id"), nullable=False)
    transaction_date = Column(Date, nullable=False)
    paid_now = Column(CHAR(1), nullable=False)
    expiration_date = Column(Date, nullable=False)

    client = relationship("Client")
    subscription = relationship("Subscription")

class Entry(Base):
    __tablename__ = "entry"
    entry_id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("client.client_id"), nullable=False)
    entry_time = Column(DateTime, nullable=False)
    gym_id = Column(Integer, ForeignKey("gym.gym_id"), nullable=False)

    client = relationship("Client")
    gym = relationship("Gym")

class Equipment(Base):
    __tablename__ = "equipment"
    equipment_id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(Integer, nullable=False)
    gym_id = Column(Integer, ForeignKey("gym.gym_id"))
    producer = Column(String(128), nullable=False)
    name = Column(String(64), nullable=False)
    state = Column(String(16), nullable=False)
    date_bought = Column(Date, nullable=False)
    date_produced = Column(Date, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    equipment_type = Column(String(16), nullable=False)

    gym = relationship("Gym")

    __mapper_args__ = {
        "polymorphic_on": equipment_type,
        "polymorphic_identity": "equipment",
    }

class Weight(Equipment):
    __tablename__ = "weight"
    equipment_id = Column(Integer, ForeignKey("equipment.equipment_id"), primary_key=True)
    weight = Column(Numeric(10, 2), nullable=False)
    type = Column(String(64), nullable=False)
    material = Column(String(32), nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "weight",
    }

class Machine(Equipment):
    __tablename__ = "machine"
    equipment_id = Column(Integer, ForeignKey("equipment.equipment_id"), primary_key=True)
    max_weight = Column(Integer, nullable=False)
    bodypart_target = Column(String(128), nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "machine",
    }

class Accessory(Equipment):
    __tablename__ = "accessory"
    equipment_id = Column(Integer, ForeignKey("equipment.equipment_id"), primary_key=True)
    type = Column(String(64), nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "accessory",
    }


class Article(Base):
    __tablename__ = "article"

    article_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    type = Column(String(128), nullable=False)
    stock = Column(Integer, nullable=False)

class Stocktaking(Base):
    __tablename__ = "stocktaking"

    stocktaking_id = Column(Integer, primary_key=True, index=True)
    gym_id = Column(Integer, nullable=False)
    stocktaking_date = Column(Date, nullable=False)

class TransactionClient(Base):
    __tablename__ = "transaction_client"

    transaction_client_id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("client.client_id"), nullable=False)
    receptionist_employee_id = Column(Integer, nullable=False)
    transaction_date = Column(Date, nullable=False)

    client = relationship("Client")
    articles = relationship("TransactionArticle", back_populates="transaction")

class TransactionArticle(Base):
    __tablename__ = "transaction_article"

    transaction_client_id = Column(Integer, ForeignKey("transaction_client.transaction_client_id"), primary_key=True)
    article_id = Column(Integer, ForeignKey("article.article_id"), primary_key=True)
    quantity = Column(Integer, nullable=True)

    transaction = relationship("TransactionClient", back_populates="articles")
    article = relationship("Article")

class Address(Base):
    __tablename__ = "address"

    address_id = Column(Integer, primary_key=True, index=True)
    city = Column(String(64), nullable=False)
    street = Column(String(64), nullable=False)
    building_number = Column(Integer, nullable=False)
    postal_code = Column(String(6), nullable=False)

class Gym(Base):
    __tablename__ = "gym"

    gym_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(64), nullable=False)
    established = Column(Date, nullable=False)
    email = Column(String(128), nullable=True)
    phone = Column(String(9), nullable=True)
    area = Column(Integer, nullable=True)
    open_hour = Column(Time, nullable=True)
    close_hour = Column(Time, nullable=True)
    address_id = Column(Integer, ForeignKey("address.address_id"), nullable=False)

    address = relationship("Address")

class Contract(Base):
    __tablename__ = "contract"

    contract_id = Column(Integer, primary_key=True, index=True)
    gym_id = Column(Integer, ForeignKey('gym.gym_id'), nullable=False)
    sponsor_id = Column(Integer, ForeignKey('sponsor.sponsor_id'), nullable=False)
    payment = Column(Numeric(precision=10, scale=2), nullable=False)
    contract_date = Column(Date, nullable=False)
    expiration_date = Column(Date, nullable=False)

    gym = relationship("Gym")
    sponsor = relationship("Sponsor")

class Sponsor(Base):
    __tablename__ = "sponsor"

    sponsor_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
