from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import relationship
import uuid

from .database import Base

def generate_uuid():
    return str(uuid.uuid4())  # StringとしてUUIDを生成

class Schedule(Base):
    __tablename__ = "schedules"

    uuid = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    schedule_timeslots = relationship("ScheduleTimeslot", back_populates="schedule", cascade="all, delete")
    availabilities = relationship("Availability", back_populates="schedule", cascade="all, delete")


class ScheduleTimeslot(Base):
    __tablename__ = "schedule_timeslots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    schedule_uuid = Column(String(36), ForeignKey("schedules.uuid", ondelete="CASCADE"), nullable=False, index=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    schedule = relationship("Schedule", back_populates="schedule_timeslots")
    availability_timeslots = relationship("AvailabilityTimeslot", back_populates="schedule_timeslot", cascade="all, delete")


class Availability(Base):
    __tablename__ = "availabilities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    schedule_uuid = Column(String(36), ForeignKey("schedules.uuid", ondelete="CASCADE"), nullable=False, index=True)
    guest_user_name = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    schedule = relationship("Schedule", back_populates="availabilities")
    availability_timeslots = relationship("AvailabilityTimeslot", back_populates="availability", cascade="all, delete")


class AvailabilityTimeslot(Base):
    __tablename__ = "availability_timeslots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    availability_id = Column(Integer, ForeignKey("availabilities.id", ondelete="CASCADE"), nullable=False, index=True)
    schedule_timeslot_id = Column(Integer, ForeignKey("schedule_timeslots.id", ondelete="CASCADE"), nullable=False, index=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    availability = relationship("Availability", back_populates="availability_timeslots")
    schedule_timeslot = relationship("ScheduleTimeslot", back_populates="availability_timeslots")
