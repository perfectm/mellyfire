#!/bin/bash

# FIRE Calculator Startup Script
echo "Starting FIRE Calculator..."
echo "Make sure you have installed dependencies: pip install -r requirements.txt"
echo ""

# Check if requirements are installed
python -c "import fastapi, uvicorn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

echo "Starting server on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""

# Start the server
python main.py