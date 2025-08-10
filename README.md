# FIRE Calculator Web Application

A comprehensive Financial Independence Retire Early (FIRE) calculator web application built with FastAPI, featuring Coast FIRE calculations, user authentication, and data persistence.

## Features

### Core Functionality
- **Coast FIRE Calculator**: Determine when you've saved enough to coast to retirement
- **Full FIRE Calculator**: Calculate your complete financial independence timeline
- **Interactive Projections**: Visual charts showing asset growth and milestones
- **Scenario Planning**: Save and compare different financial scenarios

### User Features
- **User Authentication**: Secure login system with JWT tokens
- **Data Persistence**: Save calculations and track progress over time
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Guest Mode**: Try the calculator without creating an account

### Technical Features
- **Database Flexibility**: PostgreSQL for production, SQLite fallback for development
- **Modern Web Stack**: FastAPI backend with Bootstrap frontend
- **Real-time Calculations**: Client-side and server-side calculation engines
- **RESTful API**: Clean API design for future mobile app integration

## Installation

### Prerequisites
- Python 3.8+
- Optional: PostgreSQL database

### Setup Steps

1. **Clone and Navigate**
   ```bash
   cd FIRE
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   The application will automatically create the database schema on startup.
   
   For PostgreSQL:
   ```bash
   # Create database
   createdb fire_calculator
   # Update DATABASE_URL in .env
   DATABASE_URL=postgresql://username:password@localhost:5432/fire_calculator
   ```

5. **Run the Application**
   ```bash
   python main.py
   ```
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Access the Application**
   Open your browser to: http://localhost:8000

## Usage

### Quick Start
1. Visit the homepage to learn about Coast FIRE
2. Go to the Calculator page
3. Enter your financial information
4. View your personalized FIRE projections

### Account Features
1. Register for an account to save calculations
2. Compare different scenarios over time
3. Track your progress toward financial independence

### API Usage
The application exposes a REST API at `/api/`:
- `POST /api/register` - Create new user account
- `POST /api/login` - Authenticate user
- `POST /api/calculate` - Perform FIRE calculations
- `GET /api/calculations` - Retrieve saved calculations
- `DELETE /api/calculations/{id}` - Delete calculation

## FIRE Calculations Explained

### Coast FIRE
Coast FIRE is achieved when you have enough invested that it will grow to support retirement at traditional age without additional contributions.

**Formula**: `Coast FIRE Number = FIRE Number ÷ (1 + Real Return Rate)^Years to Retirement`

### Full FIRE
Full FIRE is when you have enough invested to support your desired retirement lifestyle immediately.

**Formula**: `FIRE Number = Annual Expenses ÷ Safe Withdrawal Rate`

### Key Assumptions
- **Safe Withdrawal Rate**: Typically 4% (adjustable)
- **Investment Returns**: Default 7% annual return (adjustable)
- **Inflation**: Default 3% annual inflation (adjustable)
- **Real Return Rate**: Investment Return - Inflation Rate

## Project Structure

```
FIRE/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration settings
├── database.py            # Database connection and setup
├── models.py              # SQLAlchemy database models
├── schemas.py             # Pydantic data schemas
├── auth.py                # Authentication utilities
├── fire_calculator.py     # Core FIRE calculation logic
├── requirements.txt       # Python dependencies
├── templates/             # Jinja2 HTML templates
│   ├── base.html
│   ├── index.html
│   ├── calculator.html
│   ├── login.html
│   └── register.html
└── static/               # Static web assets
    ├── css/style.css
    └── js/
        ├── auth.js
        ├── calculator.js
        └── main.js
```

## Development

### Running in Development Mode
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Database Migrations
For schema changes, consider using Alembic:
```bash
alembic init alembic
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

### Testing
Basic testing can be done by:
1. Running the application
2. Registering a test account
3. Performing sample calculations
4. Verifying results against known scenarios

## Deployment

### Environment Variables
Set these in production:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Strong random key for JWT tokens
- `DEBUG=False`: Disable debug mode

### Docker Support
Create a Dockerfile for containerized deployment:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Contributing

This project is inspired by the FIRE community and aims to provide accurate, helpful financial planning tools. Key principles:

1. **Accuracy**: All calculations based on established FIRE principles
2. **Transparency**: Open source with clear calculation logic
3. **Education**: Helps users understand FIRE concepts
4. **Privacy**: User data is securely stored and never shared

## Disclaimer

This calculator provides estimates for educational purposes only. Results should not be considered as financial advice. Always consult with a qualified financial advisor for personalized recommendations.

## License

This project is provided as-is for educational and personal use. Feel free to modify and extend for your own needs.