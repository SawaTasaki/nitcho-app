from pydantic import BaseModel
from datetime import datetime
from typing import List

class ORMBase(BaseModel):
    model_config = {"from_attributes": True}


class ScheduleTimeslotBase(BaseModel):
    start_time: datetime
    end_time: datetime


class ScheduleTimeslotCreate(ScheduleTimeslotBase):
    pass


class ScheduleTimeslotRead(ScheduleTimeslotBase, ORMBase):
    id: int
    created_at: datetime
    updated_at: datetime


class ScheduleBase(BaseModel):
    title: str


class ScheduleCreate(ScheduleBase):
    timeslots: List[ScheduleTimeslotCreate]


class ScheduleReadWithScheduleTimeslots(ORMBase):
    uuid: str
    title: str
    created_at: datetime
    updated_at: datetime
    schedule_timeslots: List[ScheduleTimeslotRead]


class ScheduleReadWithAvailabilities(ORMBase):
    uuid: str
    title: str
    created_at: datetime
    updated_at: datetime
    schedule_timeslots: List[ScheduleTimeslotRead]
    availabilities: List["AvailabilityReadWithAvailabilityTimeslots"]


class AvailabilityTimeslotBase(BaseModel):
    schedule_timeslot_id: int
    start_time: datetime
    end_time: datetime


class AvailabilityTimeslotCreate(AvailabilityTimeslotBase):
    pass


class AvailabilityTimeslotRead(AvailabilityTimeslotBase, ORMBase):
    id: int
    created_at: datetime
    updated_at: datetime


class AvailabilityBase(BaseModel):
    guest_user_name: str


class AvailabilityCreate(AvailabilityBase):
    schedule_uuid: str
    timeslots: List[AvailabilityTimeslotCreate]


class AvailabilityReadWithAvailabilityTimeslots(ORMBase):
    id: int
    schedule_uuid: str
    guest_user_name: str
    created_at: datetime
    updated_at: datetime
    availability_timeslots: List[AvailabilityTimeslotRead]

ScheduleReadWithAvailabilities.model_rebuild()
AvailabilityReadWithAvailabilityTimeslots.model_rebuild()
