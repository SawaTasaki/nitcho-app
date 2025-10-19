import os
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# from . import models, schemas, crud
# from .database import SessionLocal, engine
import models, schemas, crud
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine, checkfirst=True)

app = FastAPI(root_path="/api")

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/schedules", response_model=schemas.ScheduleReadWithScheduleTimeslots)
def create_schedule(schedule: schemas.ScheduleCreate, db: Session = Depends(get_db)):
    return crud.create_schedule(db, schedule)


@app.get("/schedules/{schedule_uuid}", response_model=schemas.ScheduleReadWithScheduleTimeslots)
def read_schedule(schedule_uuid: str, db: Session = Depends(get_db)):
    db_schedule = crud.get_schedule(db, schedule_uuid)
    if not db_schedule:
        raise HTTPException(status_code=404, detail="そのUUIDのスケジュールは見つかりませんでした。")
    return db_schedule


@app.post("/availabilities", response_model=schemas.AvailabilityReadWithAvailabilityTimeslots)
def create_availability(availability: schemas.AvailabilityCreate, db: Session = Depends(get_db)):
    return crud.create_availability(db, availability)


@app.get("/availabilities/{availability_id}", response_model=schemas.AvailabilityReadWithAvailabilityTimeslots)
def read_availability(availability_id: int, db: Session = Depends(get_db)):
    db_avail = crud.get_availability(db, availability_id)
    if not db_avail:
        raise HTTPException(status_code=404, detail="可用性が見つかりませんでした。")
    return db_avail


@app.get("/schedules/{schedule_uuid}/with-availabilities", response_model=schemas.ScheduleReadWithAvailabilities)
def read_schedule_with_availabilities(schedule_uuid: str, db: Session = Depends(get_db)):
    db_schedule = crud.get_schedule_with_availabilities(db, schedule_uuid)
    if not db_schedule:
        raise HTTPException(status_code=404, detail="そのUUIDのスケジュールは見つかりませんでした。")
    return db_schedule


@app.delete("/availabilities/{availability_id}")
def delete_availability_for_user(availability_id: int, schedule_uuid: str, db: Session = Depends(get_db)):
    deleted_id = crud.delete_availability_with_schedule(db, availability_id, schedule_uuid)
    if deleted_id is None:
        raise HTTPException(status_code=404, detail="対象の可用性が見つかりませんでした。")
    return {"message": "Availability deleted", "availability_id": deleted_id, "schedule_uuid": schedule_uuid}
