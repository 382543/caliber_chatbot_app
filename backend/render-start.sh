#!/bin/bash
# Render start script for backend
uvicorn app:app --host 0.0.0.0 --port $PORT
