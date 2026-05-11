from sqlalchemy import Column, Integer, String, Date, ForeignKey,Numeric,CHAR, DateTime, Time
from .database import Base
from sqlalchemy.orm import relationship



class Gym(Base):
    __tablename__ = "gym"
    gym_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(64), nullable=False)
    established = Column(Date, nullable=False)
    email = Column(String(128))
    phone = Column(String(9))
    area = Column(Integer)
    open_hour = Column(Time)
    close_hour = Column(Time)
    address_id = Column(Integer, nullable=False)

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