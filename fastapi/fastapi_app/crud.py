from sqlalchemy.orm import Session
from . import models, schemas

def create_schedule(db: Session, schedule: schemas.ScheduleCreate):
    db_schedule = models.Schedule(title=schedule.title)
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)

    # bulk insert timeslots
    timeslots = [
        models.ScheduleTimeslot(
            schedule_uuid=db_schedule.uuid,
            start_time=t.start_time,
            end_time=t.end_time
        )
        for t in schedule.timeslots
    ]
    db.add_all(timeslots)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def get_schedule(db: Session, schedule_uuid):
    return db.query(models.Schedule).filter(models.Schedule.uuid == schedule_uuid).first()
