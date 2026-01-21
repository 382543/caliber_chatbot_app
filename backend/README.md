# Backend API - Port 5000

## Quick Start

1. **Install dependencies** (one time):
   ```cmd
   pip install -r requirements.txt
   ```

2. **Start the backend server**:
   ```cmd
   python -m uvicorn app:app --host 0.0.0.0 --port 5000
   ```

   Or with auto-reload for development:
   ```cmd
   python -m uvicorn app:app --host 0.0.0.0 --port 5000 --reload
   ```

## API Endpoints

All endpoints run on `http://localhost:5000`

- **GET /** - Health check
- **POST /predict** - Food classification (upload image file)
- **POST /api/chat** - Chatbot (send JSON: `{"message": "your question"}`)

## Frontend Setup

The frontend (in `frontend`) is already configured to use port 5000.

Start frontend:
```cmd
cd ..\frontend
npm install
npm run dev
```

Frontend will run on port 5173 (or 5174) and connect to backend on port 5000.

## Environment Variables

`.env` file contains:
- `GEMINI_API_KEY` - For chatbot functionality

## Notes

- Both frontend and backend communicate on port 5000
- Model uses EfficientNetV2 with ImageNet pretrained weights
- Chatbot uses Google Gemini API
