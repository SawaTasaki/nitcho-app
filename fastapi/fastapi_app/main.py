from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from . import models, schemas, crud
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

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

@app.post("/schedules", response_model=schemas.ScheduleRead)
def create_schedule(schedule: schemas.ScheduleCreate, db: Session = Depends(get_db)):
    return crud.create_schedule(db, schedule)

@app.get("/schedules/{schedule_uuid}", response_model=schemas.ScheduleRead)
def read_schedule(schedule_uuid: UUID, db: Session = Depends(get_db)):
    db_schedule = crud.get_schedule(db, schedule_uuid)
    if not db_schedule:
        raise HTTPException(status_code=404, detail="そのUUIDのスケジュールは見つかりませんでした。")
    return db_schedule
