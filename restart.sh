#!/bin/bash

# FIRE Calculator Restart Script
echo "Restarting FIRE Calculator..."

# Stop the existing server
echo "Stopping existing server..."
pkill -f "python main.py" || pkill -f "uvicorn main:app"

# Wait a moment for processes to terminate
sleep 2

# Start the server again
echo "Starting server..."
./start.sh