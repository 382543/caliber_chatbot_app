# Caliber Food Classification & Health Chatbot

Full-stack application with food image classification and health chatbot powered by AI.

## Architecture

- **Backend**: FastAPI (Python) - Port 5000
  - Food classification using EfficientNetV2
  - Health chatbot using Google Gemini API
  
- **Frontend**: React + Vite - Port 5173/5174
  - Camera page for food detection
  - Health chatbot widget
  - Lifestyle tracking

## Quick Start

### 1. Backend Setup (Terminal 1)

```cmd
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 5000
```

**Or use the startup script:**
```cmd
cd backend
start.bat
```

Backend will run on: `http://localhost:5000`

### 2. Frontend Setup (Terminal 2)

```cmd
cd caliber_chatbot.app
npm install
npm run dev
```

**Or use the startup script:**
```cmd
cd caliber_chatbot.app
start.bat
```

Frontend will run on: `http://localhost:5173`

## API Endpoints (Port 5000)

- `GET /` - API health check
- `POST /predict` - Upload image for food classification
- `POST /api/chat` - Send message to health chatbot

## Environment Variables

Create `.env` in `backend/` folder:
```
GEMINI_API_KEY=your_api_key_here
```

## Project Structure

```
sushi/
├── backend/              # FastAPI backend (Port 5000)
│   ├── app.py           # Main API server
│   ├── requirements.txt # Python dependencies
│   ├── .env            # Environment variables
│   └── food_classification_model.keras
│
├── caliber_chatbot.app/ # React frontend (Port 5173)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Camera.jsx      # Food detection page
│   │   │   ├── ChatWidget.jsx  # Health chatbot
│   │   │   └── Lifestyle.jsx   # Lifestyle tracking
│   │   └── App.jsx
│   └── package.json
│
└── README.md           # This file
```

## Features

### Food Classification
- Upload or capture food images
- Detect food items from 58 categories
- See top 5 predictions with confidence scores

### Health Chatbot
- Ask health and wellness questions
- Get symptoms advice and daily care tips
- Powered by Google Gemini AI

### Lifestyle Tracking
- Track daily activities and health metrics
- Personalized wellness recommendations

## Troubleshooting

### Backend not starting?
- Ensure Python 3.8+ is installed
- Check if port 5000 is available
- Verify all dependencies are installed: `pip install -r requirements.txt`

### Frontend not connecting?
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify API_BASE is set to `http://localhost:5000`

### 404 Errors?
- Backend must be running BEFORE starting frontend
- Check terminal logs for errors
- Visit `http://localhost:5000` to verify backend is up

## Tech Stack

**Backend:**
- FastAPI
- TensorFlow/Keras
- Google Generative AI
- OpenCV, Pillow

**Frontend:**
- React 18
- Vite
- Lucide Icons
- Modern CSS

## Development

Both frontend and backend support hot-reload:
- Backend: Use `--reload` flag with uvicorn
- Frontend: Vite automatically hot-reloads

## License

MIT
