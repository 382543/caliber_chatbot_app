@echo off
echo ========================================
echo Starting Backend Server on Port 5000
echo ========================================
echo.
python -m uvicorn app:app --host 0.0.0.0 --port 5000
