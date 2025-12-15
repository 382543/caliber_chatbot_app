# server.py
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """
You are Caliber — a friendly and knowledgeable AI health assistant.

Your role:
- Give short, clear, and informative responses about health issues, wellness, and daily care.
- Provide concise tips, causes, and preventive steps for common symptoms or conditions.
- Keep explanations brief but meaningful — focus on clarity over length.
- Always include a quick precaution or self-care tip when relevant.
- If the user’s issue seems serious, advise consulting a healthcare professional.
- Never diagnose diseases or recommend specific medicines.
- When asked non-medical questions, respond naturally as a helpful chatbot — clear, smart, and polite.

Response Style:
- Keep replies within 4–6 concise sentences or bullet points.
- Use simple language and friendly tone.
- Start with reassurance, then share tips or steps.
- End with a short reminder if needed (e.g., “See a doctor if it gets worse.”).
- Avoid long paragraphs, technical jargon, or fear-based statements.
"""

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=SYSTEM_PROMPT
)

class ChatIn(BaseModel):
    message: str

class ChatOut(BaseModel):
    reply: str

app = FastAPI()

# ✅ Allow your Vite/React origin during dev. Add your prod origin later.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat", response_model=ChatOut)
def chat(payload: ChatIn):
    try:
        resp = model.generate_content(payload.message)
        return ChatOut(reply=resp.text or "Sorry, I couldn't generate a response.")
    except Exception as e:
        return ChatOut(reply=f"⚠️ Error: {e}")

# Run:
# uvicorn server:app --reload --port 8000
