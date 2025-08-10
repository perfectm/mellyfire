# MellyFIRE Calculator 🔥

A comprehensive FIRE (Financial Independence, Retire Early) calculator with advanced Monte Carlo simulation and Coast FIRE functionality.

## Features

### 🎯 Advanced FIRE Calculations
- **Monte Carlo Simulation**: 10,000 scenario testing with 90% success rate threshold
- **Life Expectancy Integration**: Age-based retirement duration calculations
- **Sequence of Returns Risk**: Realistic market volatility modeling
- **Coast FIRE Analysis**: Calculate when you can stop saving and coast to retirement

### 💼 Comprehensive Financial Planning
- **401K Contributions**: Employee contributions with employer matching
- **Social Security Integration**: Primary and spouse benefits with timing optimization
- **Advanced Mode**: Separate retirement vs taxable account management
- **Spouse Support**: Dual-income household calculations

### 🎨 Modern User Experience
- **Interactive Slider**: Intuitive retirement age selection
- **Real-time Calculations**: Live updates as you adjust parameters
- **Auto-save & Load**: Automatic loading of most recent calculations
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme Support**: Enhanced contrast for better readability

### 📊 Detailed Analysis & Projections
- **Asset Growth Charts**: Visual projection of your FIRE journey
- **Success Rate Display**: Monte Carlo simulation statistics
- **Status Indicators**: Track Coast FIRE and Full FIRE achievement
- **Personalized Recommendations**: AI-driven insights based on your scenario

### 🛠️ Technical Features
- **FastAPI Backend**: Modern Python web framework
- **SQLite Database**: Lightweight, reliable data storage
- **JWT Authentication**: Secure user session management
- **Bootstrap 5 UI**: Clean, responsive interface design

## Quick Start 🚀

### Prerequisites
- Python 3.8+
- pip package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/perfectm/mellyfire.git
   cd mellyfire
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python main.py
   ```

4. **Access the calculator**
   - Open your browser to `http://localhost:8000`
   - Register an account or use guest mode
   - Start planning your path to financial independence!

## Monte Carlo Simulation 🎲

MellyFIRE uses sophisticated Monte Carlo simulation to provide more accurate FIRE numbers than traditional 4% rule calculations:

- **Market Volatility**: Models realistic return distributions (7% mean, 20% std dev)
- **Inflation Impact**: Accounts for rising expenses over retirement
- **Success Optimization**: Finds minimum portfolio size for 90% success rate
- **Lifetime Awareness**: Adjusts calculations based on expected retirement duration

### Example Results
- **Traditional 4% Rule**: $1,000,000 (for $40k expenses)
- **Monte Carlo Result**: $1,321,045 (32% higher for realistic market conditions)

## Advanced Features 💡

### Coast FIRE Calculation
Determine when you can stop saving and let compound growth carry you to retirement:
- **Time-based milestones**: See your Coast FIRE target at each age
- **Growth projections**: Visualize how your current assets will grow
- **Early achievement tracking**: Know when you've reached Coast FIRE status

### Social Security Integration
- **Benefit estimation**: Input your expected Social Security benefits
- **Timing optimization**: Account for early vs full vs delayed retirement
- **Spouse coordination**: Handle dual Social Security scenarios
- **Bridge calculations**: Manage the gap between early retirement and benefit eligibility

### 401K Optimization
- **Employee contributions**: Percentage-based calculations
- **Employer matching**: Model various matching formulas
- **Annual limits**: Stay within IRS contribution limits
- **Tax advantages**: Factor in pre-tax savings benefits

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

## Security & Privacy 🔒

- **Secure Authentication**: JWT tokens with proper expiration
- **Data Encryption**: Sensitive financial data protection
- **Local Storage**: Your data stays on your device and our secure servers
- **No Third-party Tracking**: Privacy-focused design

## Contributing 🤝

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Inspired by the FIRE community and financial independence movement
- Built with modern web technologies for optimal performance
- Monte Carlo methodology based on academic research in portfolio management
- UI/UX inspired by leading financial planning tools

---

**Start your FIRE journey today with MellyFIRE Calculator!** 🚀

*This calculator provides estimates for educational purposes. Please consult with a qualified financial advisor for personalized financial planning advice.*