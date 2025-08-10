# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive FIRE (Financial Independence, Retire Early) calculator web application built with FastAPI. It features Coast FIRE calculations, user authentication, data persistence, and interactive visualizations. The application is inspired by WalletBurst's Coast FIRE calculator and addresses common questions from the r/coastFIRE community.

## Development Commands

### Running the Web Application
```bash
# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python main.py
# OR
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Database Setup
The application uses SQLite by default with PostgreSQL fallback support:
```bash
# For development (automatic)
# SQLite database created automatically

# For production with PostgreSQL
export DATABASE_URL="postgresql://username:password@localhost:5432/fire_calculator"
```

### Testing FIRE Calculations
```bash
# Test calculation logic directly
python -c "
from fire_calculator import FireCalculator
calc = FireCalculator(30, 65, 50000, 5000, 3000, 1500, 40000)
print(calc.calculate_all())
"
```

### API Testing
```bash
# Test user registration
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "username": "testuser", "password": "password123"}'

# Test FIRE calculation (requires auth token)
curl -X POST http://localhost:8000/api/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"current_age": 30, "retirement_age": 65, "current_assets": 50000, ...}'
```

## Project Structure

### Backend Components
- `main.py` - FastAPI application with API endpoints and HTML routes
- `config.py` - Application configuration and environment settings
- `database.py` - Database connection and session management
- `models.py` - SQLAlchemy database models for users and calculations
- `schemas.py` - Pydantic data validation schemas
- `auth.py` - JWT authentication and password hashing utilities
- `fire_calculator.py` - Core FIRE calculation engine with Coast FIRE logic

### Frontend Components
- `templates/` - Jinja2 HTML templates (base, index, calculator, login, register)
- `static/css/style.css` - Custom styling with Bootstrap integration
- `static/js/` - JavaScript for authentication, calculator UI, and API interactions
  - `auth.js` - Authentication management
  - `calculator.js` - FIRE calculation UI and Chart.js integration
  - `main.js` - Common utilities and page interactions

### Legacy Components (Reference Only)
- `app.py` - Original Streamlit FIRE calculator
- `fire.ipynb` - Jupyter notebook with calculation prototypes
- `import streamlit as st.py` - Secondary data collection app

## Key Architecture Components

### FIRE Calculation Engine (`fire_calculator.py`)
- **Coast FIRE Calculator**: Determines amount needed today to coast to retirement
- **Full FIRE Calculator**: Calculates complete financial independence requirements
- **Projection Engine**: Year-by-year asset growth and withdrawal projections
- **Inflation Modeling**: Real return rates and inflation-adjusted expenses
- **Special Scenarios**: Social Security integration, early retirement penalties

### Authentication System
- JWT token-based authentication with secure password hashing
- User registration, login, and session management
- Protected API endpoints for saved calculations

### Database Layer
- SQLAlchemy ORM with PostgreSQL/SQLite dual support
- User accounts with calculation history
- Automatic schema creation and migration support

### Frontend Architecture
- **Progressive Enhancement**: Works without JavaScript, enhanced with it
- **Responsive Design**: Bootstrap-based UI that works on all devices
- **Interactive Charts**: Chart.js for asset projection visualizations
- **Guest Mode**: Try calculations without account creation

## Core Calculations

### Coast FIRE Formula
```
Coast FIRE Number = FIRE Number ÷ (1 + Real Return Rate)^Years to Retirement
Real Return Rate = Investment Return Rate - Inflation Rate
```

### FIRE Number Formula
```
FIRE Number = Annual Retirement Expenses ÷ Safe Withdrawal Rate
```

### Years to FIRE Calculation
Uses compound interest with regular contributions:
```
FV = PV(1+r)^t + PMT[((1+r)^t - 1)/r]
```

## API Endpoints

### Authentication
- `POST /api/register` - Create user account
- `POST /api/login` - Authenticate user

### Calculations
- `POST /api/calculate` - Perform FIRE calculation and save result
- `GET /api/calculations` - Retrieve user's saved calculations
- `DELETE /api/calculations/{id}` - Delete saved calculation

### Web Routes
- `GET /` - Homepage with FIRE education
- `GET /calculator` - Interactive calculator interface
- `GET /login` - User login form
- `GET /register` - User registration form

## Development Notes

- The application handles both authenticated users (with saved calculations) and guest users
- Chart.js provides interactive visualizations of asset growth over time
- Bootstrap 5 is used for responsive design
- Font Awesome provides icons throughout the interface
- All calculations are validated both client-side and server-side
- The database automatically falls back from PostgreSQL to SQLite if connection fails

## Configuration

Key environment variables:
- `DATABASE_URL` - Database connection string
- `SECRET_KEY` - JWT signing key (change in production)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time

## Deployment Considerations

- Set `SECRET_KEY` to a strong random value in production
- Use PostgreSQL for production deployments
- Consider using Redis for session storage in multi-server setups
- Enable HTTPS for production deployments