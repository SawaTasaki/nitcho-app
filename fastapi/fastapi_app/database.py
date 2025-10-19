import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# user = os.getenv("POSTGRES_USER")
# password = os.getenv("POSTGRES_PASSWORD")
# host = os.getenv("POSTGRES_HOST", "localhost")
# port = os.getenv("POSTGRES_PORT", "5432")
# name = os.getenv("POSTGRES_DB")
user = os.getenv("MYSQL_USER")
password = os.getenv("MYSQL_PASSWORD")
host = os.getenv("MYSQL_HOST", "localhost")
port = os.getenv("MYSQL_PORT", "3306")
name = os.getenv("MYSQL_DATABASE")

if not all([user, password, host, port, name]):
    raise RuntimeError("🚨 DB の接続情報が不足しています。環境変数を確認してください。🚨")

# DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{name}"
DATABASE_URL = f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}?charset=utf8mb4"

# engine = create_engine(DATABASE_URL)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
