from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import settings
import os

# Database URL with fallback logic
database_url = settings.DATABASE_URL

# Handle PostgreSQL vs SQLite
if database_url.startswith("postgresql://"):
    try:
        # Test PostgreSQL connection
        test_engine = create_engine(database_url)
        test_connection = test_engine.connect()
        test_connection.close()
        test_engine.dispose()
    except Exception as e:
        print(f"PostgreSQL connection failed: {e}")
        print("Falling back to SQLite...")
        database_url = "sqlite:///./fire_calculator.db"
elif database_url.startswith("sqlite://"):
    # Ensure the directory exists for SQLite
    db_path = database_url.replace("sqlite:///", "")
    os.makedirs(os.path.dirname(db_path) if os.path.dirname(db_path) else ".", exist_ok=True)

# Create engine with appropriate settings
if database_url.startswith("sqlite://"):
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()