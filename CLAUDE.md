# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MellyFIRE Calculator** - The Internet's most advanced FIRE calculator web application built with FastAPI. Features Monte Carlo simulation, Coast FIRE calculations, 401K optimization, Social Security integration, user authentication, and sophisticated data visualizations. The application uses advanced statistical modeling to provide more accurate FIRE numbers than traditional 4% rule calculators.

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
# Test Monte Carlo simulation directly
python -c "
from fire_calculator import FireCalculator
calc = FireCalculator(30, 65, 100000, 7000, 3000, 1500, 40000)
results = calc.calculate_all()
print(f'Traditional vs Monte Carlo FIRE: ${results[\"fire_number\"]:,.0f}')
if hasattr(calc, 'last_simulation_stats'):
    print(f'Success Rate: {calc.last_simulation_stats[\"success_rate\"]:.1%}')
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
- `fire_calculator.py` - Advanced FIRE calculation engine with Monte Carlo simulation, Coast FIRE logic, 401K optimization, and Social Security integration

### Frontend Components
- `templates/` - Jinja2 HTML templates (base, index, calculator, login, register)
- `static/css/style.css` - Custom styling with Bootstrap integration
- `static/js/` - JavaScript for authentication, calculator UI, and API interactions
  - `auth.js` - Authentication management with auto-load of recent calculations
  - `calculator.js` - Advanced FIRE calculation UI with dual-axis Chart.js visualizations and interactive slider controls
  - `main.js` - Common utilities and page interactions

### Legacy Components (Reference Only)
- `app.py` - Original Streamlit FIRE calculator
- `fire.ipynb` - Jupyter notebook with calculation prototypes
- `import streamlit as st.py` - Secondary data collection app

## Key Architecture Components

### Advanced FIRE Calculation Engine (`fire_calculator.py`)
- **Monte Carlo Simulation**: 10,000-scenario analysis with 90% success rate optimization
- **Life Expectancy Integration**: Age-based retirement duration calculations
- **Coast FIRE Calculator**: Determines amount needed today to coast to retirement
- **Full FIRE Calculator**: More accurate calculations than traditional 4% rule
- **401K Optimization**: Employee contributions and employer matching calculations
- **Social Security Integration**: Primary and spouse benefits with timing optimization
- **Advanced Mode**: Separate retirement vs taxable account management
- **Projection Engine**: Year-by-year asset growth with realistic market volatility
- **Sequence of Returns Risk**: Accounts for market timing in early retirement

### Authentication System
- JWT token-based authentication with secure password hashing
- User registration, login, and session management
- Protected API endpoints for saved calculations

### Database Layer
- SQLAlchemy ORM with PostgreSQL/SQLite dual support
- User accounts with calculation history
- Automatic schema creation and migration support

### Advanced Frontend Architecture
- **Progressive Enhancement**: Works without JavaScript, enhanced with it
- **Responsive Design**: Bootstrap-based UI with enhanced dark theme support
- **Interactive Dual-Axis Charts**: Chart.js with separate scales for assets vs targets
- **Interactive Controls**: Retirement age slider with real-time year calculation
- **Auto-load Functionality**: Automatic loading of most recent calculations on login
- **Enhanced Contrast**: Accessibility-focused design with proper contrast ratios
- **Guest Mode**: Try calculations without account creation
- **Real-time Updates**: Live calculation updates as user adjusts parameters

## Core Calculations

### Monte Carlo FIRE Number
Uses sophisticated simulation instead of simple 4% rule:
- **10,000 scenarios** with random market returns (7% mean, 20% std dev)
- **Life expectancy based** on current age (85 for ≤30, declining with age)
- **90% success rate** threshold for portfolio survival
- **Binary search optimization** to find minimum required assets
- **Results**: Typically 20-40% higher than traditional 4% rule

### Traditional Coast FIRE Formula (Fallback)
```
Coast FIRE Number = FIRE Number ÷ (1 + Real Return Rate)^Years to Retirement
Real Return Rate = Investment Return Rate - Inflation Rate
```

### 401K Optimization
```
Employee Monthly = Monthly Income × Contribution Percentage
Employer Match = Employee Contribution × Match Percentage
Total 401K = Employee + Match (added to retirement accounts)
```

### Social Security Integration
```
Net FIRE Needed = Max(0, Annual Expenses - Total SS Benefits) ÷ Safe Withdrawal Rate
Bridge Assets = (Retirement Age - SS Age) × Annual Expenses (if retiring early)
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

### Recent Major Features (2024)
- **Monte Carlo Simulation**: Advanced statistical modeling for accurate FIRE numbers
- **Dual-Axis Charts**: Separate scales for asset growth vs FIRE targets
- **Interactive Slider**: Retirement age selection with real-time year display  
- **Auto-load**: Most recent calculation loads automatically on login
- **Enhanced Contrast**: Improved accessibility with proper text contrast ratios
- **Google AdSense**: Monetization integration ready for deployment

### Architecture Notes
- Application handles both authenticated users (with saved calculations) and guest users
- Chart.js provides sophisticated dual-axis visualizations of asset projections
- Bootstrap 5 with custom dark theme styling for optimal readability
- Font Awesome provides comprehensive icon system throughout interface
- All calculations validated both client-side (guest) and server-side (authenticated)
- Database automatically falls back from PostgreSQL to SQLite for development
- Advanced mode separates retirement accounts from taxable accounts for complex scenarios

### Current Status
- **Repository**: https://github.com/perfectm/mellyfire
- **Branding**: "MellyFIRE Calculator - The Internet's most advanced FIRE calculator"
- **Production Ready**: Fully functional with comprehensive feature set

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