from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import uvicorn
import os
from pathlib import Path

from database import engine, get_db
from auth import create_access_token, verify_token, get_password_hash, verify_password
from models import User, FireCalculation, Base
from schemas import UserCreate, UserLogin, FireCalculationCreate, FireCalculationResponse
from fire_calculator import FireCalculator
from config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown
    pass

app = FastAPI(
    title="FIRE Calculator",
    description="A comprehensive Financial Independence Retire Early calculator with Coast FIRE support",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Security
security = HTTPBearer()

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

# Routes
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/calculator", response_class=HTMLResponse)
async def calculator_page(request: Request):
    return templates.TemplateResponse("calculator.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.post("/api/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(db_user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "username": db_user.username
    }

@app.post("/api/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    # Verify user credentials
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(db_user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "username": db_user.username
    }

@app.post("/api/calculate", response_model=FireCalculationResponse)
async def calculate_fire(
    calculation: FireCalculationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Perform FIRE calculations
    calculator = FireCalculator(
        current_age=calculation.current_age,
        retirement_age=calculation.retirement_age,
        current_assets=calculation.current_assets,
        monthly_income=calculation.monthly_income,
        monthly_expenses=calculation.monthly_expenses,
        monthly_savings=calculation.monthly_savings,
        retirement_expenses=calculation.retirement_expenses,
        investment_return_rate=calculation.investment_return_rate / 100,
        inflation_rate=calculation.inflation_rate / 100,
        safe_withdrawal_rate=calculation.safe_withdrawal_rate / 100,
        # Advanced mode parameters
        advanced_mode=calculation.advanced_mode,
        retirement_accounts=calculation.retirement_accounts or 0,
        taxable_accounts=calculation.taxable_accounts or 0,
        retirement_account_return_rate=(calculation.retirement_account_return_rate or 7.0) / 100,
        # Social Security parameters
        social_security_enabled=calculation.social_security_enabled,
        social_security_start_age=calculation.social_security_start_age or 65,
        social_security_monthly_benefit=calculation.social_security_monthly_benefit or 0
    )
    
    results = calculator.calculate_all()
    
    # Save calculation to database
    db_calculation = FireCalculation(
        user_id=current_user.id,
        **calculation.dict(),
        **results
    )
    db.add(db_calculation)
    db.commit()
    db.refresh(db_calculation)
    
    return FireCalculationResponse(
        id=db_calculation.id,
        **calculation.dict(),
        **results,
        created_at=db_calculation.created_at
    )

@app.get("/api/calculations")
async def get_user_calculations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    calculations = db.query(FireCalculation).filter(
        FireCalculation.user_id == current_user.id
    ).order_by(FireCalculation.created_at.desc()).all()
    
    return [
        FireCalculationResponse(
            id=calc.id,
            current_age=calc.current_age,
            retirement_age=calc.retirement_age,
            current_assets=calc.current_assets,
            monthly_income=calc.monthly_income,
            monthly_expenses=calc.monthly_expenses,
            monthly_savings=calc.monthly_savings,
            retirement_expenses=calc.retirement_expenses,
            investment_return_rate=calc.investment_return_rate,
            inflation_rate=calc.inflation_rate,
            safe_withdrawal_rate=calc.safe_withdrawal_rate,
            fire_number=calc.fire_number,
            coast_fire_number=calc.coast_fire_number,
            years_to_fire=calc.years_to_fire,
            years_to_coast_fire=calc.years_to_coast_fire,
            coast_fire_age=calc.coast_fire_age,
            projection_data=calc.projection_data,
            created_at=calc.created_at
        ) for calc in calculations
    ]

@app.delete("/api/calculations/{calculation_id}")
async def delete_calculation(
    calculation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    calculation = db.query(FireCalculation).filter(
        FireCalculation.id == calculation_id,
        FireCalculation.user_id == current_user.id
    ).first()
    
    if not calculation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calculation not found"
        )
    
    db.delete(calculation)
    db.commit()
    
    return {"message": "Calculation deleted successfully"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)