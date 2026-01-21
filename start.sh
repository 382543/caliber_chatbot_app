#!/bin/bash
# Start script for Linux/Mac - Caliber Food Classification App

echo "==============================================="
echo "   Caliber Food Classification & Health Chatbot"
echo "==============================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.11 or higher"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js 20.x or higher"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Virtual environment not found. Creating one..."
    python3 -m venv .venv
    echo "Virtual environment created!"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Install/update Python dependencies
echo ""
echo "Checking Python dependencies..."
pip install -q -r requirements.txt

# Run the integrated application
echo ""
echo "Starting Caliber application..."
echo ""
python main.py
