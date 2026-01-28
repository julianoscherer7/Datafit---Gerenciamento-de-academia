from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from urllib.parse import quote_plus
import os

load_dotenv()

# Strategy: allow selection via env variables.
# If DB_ENGINE is set to 'sqlite' or 'mysql' we respect it.
# Otherwise, if DATABASE_URL is provided we use it. If nothing provided, default to a local sqlite file.

DB_ENGINE = os.getenv("DB_ENGINE", "auto").lower()  # expected: 'sqlite', 'mysql', or 'auto'
DATABASE_URL = os.getenv("DATABASE_URL")

def _build_mysql_url_from_parts():
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "")
    host = os.getenv("MYSQL_HOST", "localhost")
    port = os.getenv("MYSQL_PORT", "3306")
    db = os.getenv("MYSQL_DB", "fitdata_dev")
    # URL encode password to handle special characters
    encoded_password = quote_plus(password) if password else ""
    return f"mysql+pymysql://{user}:{encoded_password}@{host}:{port}/{db}?charset=utf8mb4"

if DB_ENGINE == "sqlite":
    # Prefer explicit SQLITE_URL, else use a default file in repository root
    SQLITE_URL = os.getenv("SQLITE_URL", "sqlite:///./fitdata_dev.db")
    DATABASE_URL = SQLITE_URL

elif DB_ENGINE == "mysql":
    if not DATABASE_URL:
        DATABASE_URL = _build_mysql_url_from_parts()

else:  # auto
    if not DATABASE_URL:
        # sensible default for local development
        DATABASE_URL = os.getenv("SQLITE_URL", "sqlite:///./fitdata_dev.db")

# Configure engine options for SQLite (thread check) vs other backends
engine_kwargs = {}
if DATABASE_URL and DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, echo=False, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency para obter sessão do banco"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
