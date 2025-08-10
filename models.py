from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to calculations
    calculations = relationship("FireCalculation", back_populates="user")

class FireCalculation(Base):
    __tablename__ = "fire_calculations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Input parameters
    current_age = Column(Integer, nullable=False)
    retirement_age = Column(Integer, nullable=False)
    current_assets = Column(Float, nullable=False)
    monthly_income = Column(Float, nullable=False)
    monthly_expenses = Column(Float, nullable=False)
    monthly_savings = Column(Float, nullable=False)
    retirement_expenses = Column(Float, nullable=False)
    investment_return_rate = Column(Float, nullable=False)
    inflation_rate = Column(Float, nullable=False)
    safe_withdrawal_rate = Column(Float, nullable=False)
    
    # Calculated results
    fire_number = Column(Float, nullable=False)
    coast_fire_number = Column(Float, nullable=False)
    years_to_fire = Column(Float, nullable=True)
    years_to_coast_fire = Column(Float, nullable=True)
    coast_fire_age = Column(Float, nullable=True)
    projection_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to user
    user = relationship("User", back_populates="calculations")