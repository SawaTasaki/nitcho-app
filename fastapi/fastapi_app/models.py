from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, func, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from .database import Base

class Schedule(Base):
    __tablename__ = "schedules"

    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    timeslots = relationship("ScheduleTimeslot", back_populates="schedule", cascade="all, delete")

class ScheduleTimeslot(Base):
    __tablename__ = "schedule_timeslots"

    id = Column(Integer, primary_key=True, index=True)
    schedule_uuid = Column(UUID(as_uuid=True), ForeignKey("schedules.uuid", ondelete="CASCADE"))
    start_time = Column(TIMESTAMP, nullable=False)
    end_time = Column(TIMESTAMP, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    schedule = relationship("Schedule", back_populates="timeslots")
