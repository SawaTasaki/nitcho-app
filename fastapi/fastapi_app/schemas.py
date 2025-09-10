from pydantic import BaseModel
from datetime import datetime
from typing import List
from uuid import UUID

class TimeslotBase(BaseModel):
    start_time: datetime
    end_time: datetime

class TimeslotCreate(TimeslotBase):
    pass

class TimeslotRead(TimeslotBase):
    id: int
    class Config:
        orm_mode = True

class ScheduleBase(BaseModel):
    title: str

class ScheduleCreate(ScheduleBase):
    timeslots: List[TimeslotCreate]

class ScheduleRead(ScheduleBase):
    uuid: UUID
    timeslots: List[TimeslotRead]
    class Config:
        orm_mode = True
