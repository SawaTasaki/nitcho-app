from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from . import models, schemas

def create_schedule(db: Session, schedule: schemas.ScheduleCreate):
    try:
        db_schedule = models.Schedule(title=schedule.title)
        db.add(db_schedule)
        db.flush()

        schedule_timeslots = [
            models.ScheduleTimeslot(
                schedule_uuid=db_schedule.uuid,
                start_time=t.start_time,
                end_time=t.end_time,
            )
            for t in schedule.timeslots
        ]
        db.add_all(schedule_timeslots)

        db.commit()
        return get_schedule(db, db_schedule.uuid)
    except:
        db.rollback()
        raise


def get_schedule(db: Session, schedule_uuid):
    return (
        db.query(models.Schedule)
        .options(selectinload(models.Schedule.schedule_timeslots))
        .filter(models.Schedule.uuid == schedule_uuid)
        .first()
    )


def create_availability(db: Session, availability: schemas.AvailabilityCreate):
    try:
        db_avail = models.Availability(
            schedule_uuid=availability.schedule_uuid,
            guest_user_name=availability.guest_user_name,
        )
        db.add(db_avail)
        db.flush()

        availability_timeslots = [
            models.AvailabilityTimeslot(
                availability_id=db_avail.id,
                schedule_timeslot_id=ts.schedule_timeslot_id,
                start_time=ts.start_time,
                end_time=ts.end_time,
            )
            for ts in availability.timeslots
        ]
        db.add_all(availability_timeslots)

        db.commit()
        return get_availability(db, db_avail.id)
    except:
        db.rollback()
        raise


def get_availability(db: Session, availability_id: int):
    return (
        db.query(models.Availability)
        .options(selectinload(models.Availability.availability_timeslots))
        .filter(models.Availability.id == availability_id)
        .first()
    )


def get_schedule_with_availabilities(db: Session, schedule_uuid):
    stmt = (
        select(models.Schedule)
        .options(
            selectinload(models.Schedule.schedule_timeslots),
            selectinload(models.Schedule.availabilities)
                .selectinload(models.Availability.availability_timeslots),
        )
        .where(models.Schedule.uuid == schedule_uuid)
    )
    result = db.execute(stmt).scalars().first()
    return result


def delete_availability_with_schedule(db: Session, availability_id: int, schedule_uuid: str):
    try:
        availability = (
            db.query(models.Availability)
            .filter(models.Availability.id == availability_id)
            .filter(models.Availability.schedule_uuid == schedule_uuid)
            .first()
        )
        if not availability:
            return None

        db.delete(availability)
        db.commit()
        return availability_id

    except:
        db.rollback()
        raise
