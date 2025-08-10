import os

class Settings:
    def __init__(self):
        # Database
        self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fire_calculator.db")
        
        # JWT Settings
        self.SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 30

settings = Settings()