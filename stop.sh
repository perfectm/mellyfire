#!/bin/bash

# FIRE Calculator Stop Script
echo "Stopping FIRE Calculator..."

# Stop the server processes
pkill -f "python main.py" && echo "Stopped python main.py process"
pkill -f "uvicorn main:app" && echo "Stopped uvicorn process"

# Check if processes are still running
if pgrep -f "python main.py" > /dev/null || pgrep -f "uvicorn main:app" > /dev/null; then
    echo "Warning: Some processes may still be running. Use 'ps aux | grep main.py' to check."
else
    echo "FIRE Calculator stopped successfully."
fi