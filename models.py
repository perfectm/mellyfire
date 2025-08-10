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
    
    # Advanced mode parameters
    advanced_mode = Column(Integer, default=0, nullable=False)  # 0 = basic, 1 = advanced
    retirement_accounts = Column(Float, default=0, nullable=True)
    taxable_accounts = Column(Float, default=0, nullable=True)
    retirement_account_return_rate = Column(Float, default=0.07, nullable=True)
    
    # Social Security parameters
    social_security_enabled = Column(Integer, default=0, nullable=False)  # 0 = disabled, 1 = enabled
    social_security_start_age = Column(Integer, default=65, nullable=True)
    social_security_monthly_benefit = Column(Float, default=0, nullable=True)
    
    # Spouse parameters
    spouse_enabled = Column(Integer, default=0, nullable=False)  # 0 = single, 1 = married
    spouse_age = Column(Integer, default=0, nullable=True)
    spouse_social_security_enabled = Column(Integer, default=0, nullable=False)
    spouse_social_security_start_age = Column(Integer, default=65, nullable=True)
    spouse_social_security_monthly_benefit = Column(Float, default=0, nullable=True)
    
    # 401K contribution parameters
    contribution_401k_percentage = Column(Float, default=6.0, nullable=False)  # Employee contribution percentage
    employer_match_percentage = Column(Float, default=50.0, nullable=False)    # Employer match percentage (% of employee contribution)
    
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