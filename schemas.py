from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: str  # Can be email or username
    password: str

class User(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class FireCalculationCreate(BaseModel):
    current_age: int = Field(..., ge=18, le=100, description="Current age in years")
    retirement_age: int = Field(..., ge=50, le=100, description="Desired retirement age")
    current_assets: float = Field(..., ge=0, description="Current invested assets ($)")
    monthly_income: float = Field(..., ge=0, description="Monthly gross income ($)")
    monthly_expenses: float = Field(..., ge=0, description="Monthly living expenses ($)")
    monthly_savings: float = Field(..., ge=0, description="Monthly savings/investments ($)")
    retirement_expenses: float = Field(..., ge=0, description="Annual expenses in retirement ($)")
    investment_return_rate: float = Field(7.0, ge=0, le=20, description="Annual investment return rate (%)")
    inflation_rate: float = Field(3.0, ge=0, le=10, description="Annual inflation rate (%)")
    safe_withdrawal_rate: float = Field(4.0, ge=2, le=8, description="Safe withdrawal rate (%)")
    
    # Advanced mode parameters
    advanced_mode: bool = Field(False, description="Enable advanced mode with retirement account separation")
    retirement_accounts: Optional[float] = Field(0, ge=0, description="Amount in retirement accounts ($)")
    taxable_accounts: Optional[float] = Field(0, ge=0, description="Amount in taxable accounts ($)")
    retirement_account_return_rate: Optional[float] = Field(7.0, ge=0, le=20, description="Retirement account return rate (%)")
    
    # Social Security parameters
    social_security_enabled: bool = Field(False, description="Include Social Security benefits")
    social_security_start_age: Optional[int] = Field(65, ge=62, le=70, description="Age to start Social Security")
    social_security_monthly_benefit: Optional[float] = Field(0, ge=0, description="Estimated monthly Social Security benefit ($)")
    
    # Spouse parameters
    spouse_enabled: bool = Field(False, description="Include spouse in calculations")
    spouse_age: Optional[int] = Field(30, ge=18, le=100, description="Current spouse age")
    spouse_social_security_enabled: bool = Field(False, description="Include spouse Social Security benefits")
    spouse_social_security_start_age: Optional[int] = Field(65, ge=62, le=70, description="Age for spouse to start Social Security")
    spouse_social_security_monthly_benefit: Optional[float] = Field(0, ge=0, description="Estimated spouse monthly Social Security benefit ($)")
    
    # 401K contribution parameters
    contribution_401k_percentage: float = Field(6.0, ge=0, le=100, description="Employee 401K contribution percentage of income")
    employer_match_percentage: float = Field(50.0, ge=0, le=200, description="Employer match percentage (% of employee contribution)")

    def validate_retirement_age(self):
        if self.retirement_age <= self.current_age:
            raise ValueError('Retirement age must be greater than current age')
        return self

class FireCalculationResponse(BaseModel):
    id: int
    current_age: int
    retirement_age: int
    current_assets: float
    monthly_income: float
    monthly_expenses: float
    monthly_savings: float
    retirement_expenses: float
    investment_return_rate: float
    inflation_rate: float
    safe_withdrawal_rate: float
    
    # Advanced mode parameters
    advanced_mode: bool
    retirement_accounts: Optional[float]
    taxable_accounts: Optional[float]
    retirement_account_return_rate: Optional[float]
    
    # Social Security parameters
    social_security_enabled: bool
    social_security_start_age: Optional[int]
    social_security_monthly_benefit: Optional[float]
    
    # Spouse parameters
    spouse_enabled: bool
    spouse_age: Optional[int]
    spouse_social_security_enabled: bool
    spouse_social_security_start_age: Optional[int]
    spouse_social_security_monthly_benefit: Optional[float]
    
    # 401K contribution parameters
    contribution_401k_percentage: float
    employer_match_percentage: float
    
    # Calculated results
    fire_number: float
    coast_fire_number: float
    years_to_fire: Optional[float]
    years_to_coast_fire: Optional[float]
    coast_fire_age: Optional[float]
    projection_data: Optional[Dict[str, Any]]
    
    created_at: datetime
    
    class Config:
        from_attributes = True