from sqlalchemy import Column, Integer, String, Date, ForeignKey
from .database import Base
from sqlalchemy.orm import relationship

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