from sqlalchemy import Column, Integer, String, Date, ForeignKey, func, Time, Numeric
from .database import Base
from sqlalchemy.orm import relationship, column_property

class Room(Base):
    __tablename__ = "room"

    room_id = Column(Integer, primary_key=True, index=True)
    gym_id = Column(Integer, nullable=False)
    name = Column(String(64), nullable=False)

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
