@echo off
REM Start script for Windows - Caliber Food Classification App
echo ===============================================
echo    Caliber Food Classification ^& Health Chatbot
echo ===============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.11 or higher
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 20.x or higher
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist ".venv\Scripts\activate.bat" (
    echo Virtual environment not found. Creating one...
    python -m venv .venv
    echo Virtual environment created!
)

REM Activate virtual environment
echo Activating virtual environment...
call .venv\Scripts\activate.bat

REM Install/update Python dependencies
echo.
echo Checking Python dependencies...
pip install -q -r requirements.txt

REM Run the integrated application
echo.
echo Starting Caliber application...
echo.
python app.py

pause
