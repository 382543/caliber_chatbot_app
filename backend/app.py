# backend/app.py  — updated safe inference (with defensive channel checks)
from __future__ import annotations
from pathlib import Path
from typing import Dict
import os
import shutil

import io
import numpy as np
from PIL import Image, ImageOps
import cv2
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import Model
from tensorflow.keras.layers import GlobalAveragePooling2D
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables for chatbot
load_dotenv()

# Import Gemini API for chatbot
try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        CHATBOT_ENABLED = True
    else:
        CHATBOT_ENABLED = False
        print("WARNING: GEMINI_API_KEY not found. Chatbot will be disabled.")
except ImportError:
    CHATBOT_ENABLED = False
    print("WARNING: google-generativeai not installed. Chatbot will be disabled.")

# ---- labels (MUST match training order)
class_names = [
    'almonds', 'apple', 'avocado', 'banana', 'beer', 'biscuits',
    'boisson-au-glucose-50g', 'bread-french-white-flour', 'bread-sourdough',
    'bread-white', 'bread-whole-wheat', 'bread-wholemeal', 'broccoli',
    'butter', 'carrot', 'cheese', 'chicken', 'chips-french-fries',
    'coffee-with-caffeine', 'corn', 'croissant', 'cucumber',
    'dark-chocolate', 'egg', 'espresso-with-caffeine', 'french-beans',
    'gruyere', 'ham-raw', 'hard-cheese', 'honey', 'jam', 'leaf-spinach',
    'mandarine', 'mayonnaise', 'mixed-nuts',
    'mixed-salad-chopped-without-sauce', 'mixed-vegetables', 'onion',
    'parmesan', 'pasta-spaghetti', 'pickle', 'pizza-margherita-baked',
    'potatoes-steamed', 'rice', 'salad-leaf-salad-green', 'salami',
    'salmon', 'sauce-savoury', 'soft-cheese', 'strawberries',
    'sweet-pepper', 'tea', 'tea-green', 'tomato', 'tomato-sauce',
    'water', 'water-mineral', 'white-coffee-with-caffeine',
    'wine-red', 'wine-white', 'zucchini'
]

# If you trained with EfficientNetV2 preprocess outside the model, set this to "effnet".
# If training used simple /255.0 OR you put Rescaling(1./255) inside the model, set "div255".
# We'll auto-detect Rescaling below and override this if necessary.
TRAIN_PIPELINE = "div255"     # "div255" or "effnet"

# ---- model discovery
BASE_DIR = Path(__file__).resolve().parent

# Check for environment variable first (for Render deployment)
env_model_path = os.getenv("MODEL_PATH")
if env_model_path and Path(env_model_path).exists():
    MODEL_PATH = Path(env_model_path)
else:
    # Fall back to local search
    CANDIDATES = [
        BASE_DIR / "food_classification_model_fixed.keras",
        BASE_DIR / "food_classification_model.keras",
        BASE_DIR / "food_classification_model.h5",
        BASE_DIR / "model.keras",
        BASE_DIR / "model.h5",
        BASE_DIR / "saved_model",
        BASE_DIR / "models" / "model.keras",
        BASE_DIR / "models" / "model.h5",
        BASE_DIR / "models" / "saved_model",
    ]
    MODEL_PATH = next((p for p in CANDIDATES if p.exists()), None)
if MODEL_PATH is None:
    raise RuntimeError(
        "Model file/folder not found next to app.py. "
        f"Checked: {', '.join(str(p.name) for p in CANDIDATES)}"
    )

# Load the model - rebuild with correct architecture matching training
print(f"Loading model from: {MODEL_PATH}")

try:
    # Try loading with custom_objects to handle Functional class
    from tensorflow.keras.saving import register_keras_serializable
    
    # Try direct load first with safe_mode disabled
    model = keras.models.load_model(
        MODEL_PATH, 
        compile=False, 
        safe_mode=False,
        custom_objects=None
    )
    print("[OK] Model loaded successfully")
except (ValueError, OSError, TypeError) as e:
    error_msg = str(e)
    print(f"[WARNING] Direct load failed: {error_msg}")
    
    # Rebuild the exact architecture from training (EfficientNetB1 as shown in notebook)
    print("Rebuilding model with correct architecture (EfficientNetB1)...")
    from tensorflow.keras.applications import EfficientNetB1
    
    base_model = EfficientNetB1(
        weights='imagenet',  # Use pretrained weights as fallback
        include_top=False,
        input_shape=(256, 256, 3)
    )
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = keras.layers.Dropout(0.2)(x)
    predictions = keras.layers.Dense(len(class_names), activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    print("[OK] Rebuilt model with EfficientNetB1 architecture")
    print("[WARNING] Using pretrained weights - predictions may not be accurate")
    print("  To get accurate predictions: Re-export your trained model with TensorFlow 2.15")

# ---- resolve input geometry & sanity checks
in_shape = model.input_shape
if not isinstance(in_shape, (list, tuple)) or len(in_shape) != 4:
    raise RuntimeError(f"Unexpected model input shape: {in_shape}")

# Keras shape: (None, H, W, C)
H = int(in_shape[1]) if in_shape[1] is not None else 256
W = int(in_shape[2]) if in_shape[2] is not None else 256
C = int(in_shape[3]) if in_shape[3] is not None else 3
TARGET_SIZE = (W, H)   # (width, height) for PIL/resize and cv2.resize expects (width,height)
EXPECTED_CH = C

# Detect whether the model contains an input Rescaling layer (e.g. Rescaling(1./255))
has_internal_rescale = any(isinstance(l, keras.layers.Rescaling) for l in model.layers)
rescale_info = None
for l in model.layers:
    if isinstance(l, keras.layers.Rescaling):
        rescale_info = getattr(l, "scale", None)
        break

# Detect whether final activation is softmax
last_layer = model.layers[-1]
last_activation = getattr(getattr(last_layer, "activation", None), "__name__", "")
has_softmax = last_activation == "softmax"

# Output classes match
num_model_classes = int(model.output_shape[-1])
if num_model_classes != len(class_names):
    raise RuntimeError(
        f"Number of classes mismatch: model outputs {num_model_classes} but labels.py has {len(class_names)}. "
        "The order/contents of class_names must exactly match training."
    )

try:
    from tensorflow.keras.applications.efficientnet_v2 import preprocess_input as effv2_pre
except Exception:
    effv2_pre = None

# ---- Chatbot System Prompt
SYSTEM_PROMPT = """
You are Caliber — a friendly and knowledgeable AI health assistant.

Your role:
- Give short, clear, and informative responses about health issues, wellness, and daily care.
- Provide concise tips, causes, and preventive steps for common symptoms or conditions.
- Keep explanations brief but meaningful — focus on clarity over length.
- Always include a quick precaution or self-care tip when relevant.
- If the user's issue seems serious, advise consulting a healthcare professional.
- Never diagnose diseases or recommend specific medicines.
- When asked non-medical questions, respond naturally as a helpful chatbot — clear, smart, and polite.

Response Style:
- Keep replies within 4–6 concise sentences or bullet points.
- Use simple language and friendly tone.
- Start with reassurance, then share tips or steps.
- End with a short reminder if needed (e.g., "See a doctor if it gets worse.").
- Avoid long paragraphs, technical jargon, or fear-based statements.
"""

# Initialize Gemini model if available
if CHATBOT_ENABLED:
    try:
        # Try gemini-1.5-flash-latest which should be available
        gemini_model = genai.GenerativeModel(
            model_name="gemini-1.5-flash-latest"
        )
    except Exception as e:
        print(f"Failed to initialize Gemini model: {e}")
        CHATBOT_ENABLED = False

# Pydantic models for chatbot
class ChatIn(BaseModel):
    message: str

class ChatOut(BaseModel):
    reply: str

# ---- FastAPI app
app = FastAPI(title="Food Classifier API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- preprocessing that matches model/training (safe & robust)
def center_crop_to_aspect(img: np.ndarray, target_w: int, target_h: int) -> np.ndarray:
    h, w = img.shape[:2]
    target_ar = target_w / target_h
    ar = w / h
    if ar > target_ar:
        new_w = int(h * target_ar)
        x0 = (w - new_w) // 2
        return img[:, x0:x0+new_w]
    else:
        new_h = int(w / target_ar)
        y0 = (h - new_h) // 2
        return img[y0:y0+new_h, :]

def preprocess_from_bytes(img_bytes: bytes) -> np.ndarray:
    """
    Returns a batch tensor shape (1, H, W, C) ready for model.predict.
    Logic:
      - Uses PIL to respect EXIF orientation and ensure RGB
      - Center-crops to model aspect, then resizes to target
      - Applies scaling only if model/training expect it:
         -> If model has Rescaling layer: DO NOT divide by 255 (model handles it)
         -> Else if TRAIN_PIPELINE == "effnet": use effv2_pre
         -> Else: divide by 255.0
    """
    # decode with PIL to preserve EXIF orientation
    im = Image.open(io.BytesIO(img_bytes))
    im = ImageOps.exif_transpose(im).convert("RGB")
    rgb = np.array(im)  # HxWx3 RGB uint8

    # center-crop to preserve aspect ratio, then resize
    rgb = center_crop_to_aspect(rgb, TARGET_SIZE[0], TARGET_SIZE[1])
    # resize (PIL style: (width, height)), use cv2 for speed here
    rgb = cv2.resize(rgb, TARGET_SIZE, interpolation=cv2.INTER_LINEAR)

    if EXPECTED_CH == 1:
        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
        x = gray[..., None].astype("float32")
        # models expecting single-channel rarely had rescaling inside; follow same logic:
        if not has_internal_rescale:
            x = x / 255.0
        return np.expand_dims(x, 0)  # (1,H,W,1)

    # rgb is HxWx3 in RGB order (uint8)
    x = rgb.astype("float32")

    # Decide scaling
    if has_internal_rescale:
        # Model performs the rescaling internally — feed raw 0..255 values
        pass
    else:
        # No internal rescale — follow TRAIN_PIPELINE or effnet if requested
        if TRAIN_PIPELINE == "effnet":
            if effv2_pre is None:
                raise RuntimeError("EfficientNet preprocess requested (TRAIN_PIPELINE='effnet') but preprocess_input not available.")
            # effv2_pre expects float images (0..255) and handles centering/scale
            x = effv2_pre(x)
        else:
            x = x / 255.0

    return np.expand_dims(x, 0)  # (1, H, W, 3)


# ---- routes
@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Food classifier API is running",
        "model": f"{MODEL_PATH.name}",
        "input_shape": model.input_shape,
        "target_size_used": {"width": W, "height": H, "channels": C},
        "train_pipeline": TRAIN_PIPELINE,
        "num_classes": len(class_names),
        "has_internal_rescale": has_internal_rescale,
        "internal_rescale_value": rescale_info,
        "model_final_activation": last_activation,
    }

@app.get("/debug")
def debug():
    files = sorted(p.name for p in BASE_DIR.iterdir())
    return {"cwd": str(BASE_DIR), "files": files, "model_path": str(MODEL_PATH)}

@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> Dict:
    try:
        img_bytes = await file.read()
        if not img_bytes:
            raise HTTPException(status_code=400, detail="Empty file")

        # --- preprocessing + safety checks
        x = preprocess_from_bytes(img_bytes)  # (1,H,W,C)
        print("DEBUG: preprocessed input shape:", x.shape, "dtype:", x.dtype)  # server log

        # If channel mismatch, attempt a safe conversion:
        if x.ndim == 4 and x.shape[-1] != EXPECTED_CH:
            # if model expects RGB (3) but got single-channel, tile it
            if EXPECTED_CH == 3 and x.shape[-1] == 1:
                x = np.repeat(x, 3, axis=-1)  # (1,H,W,3)
                print("DEBUG: converted single-channel -> 3-channel by repeating axis.")
            # if model expects single-channel but got 3, convert by averaging channels
            elif EXPECTED_CH == 1 and x.shape[-1] == 3:
                x = np.mean(x, axis=-1, keepdims=True)
                print("DEBUG: converted 3-channel -> single-channel by averaging channels.")
            else:
                raise HTTPException(status_code=400, detail=f"Bad input channels: got {x.shape[-1]}, expected {EXPECTED_CH}")

        preds = model.predict(x, verbose=0)   # (1, num_classes)
        probs = preds[0]

        # If logits, convert to probabilities
        if probs.ndim == 1 and (probs.min() < 0 or probs.max() > 1.0):
            probs = tf.nn.softmax(probs).numpy()

        # normalize (robust)
        probs = np.asarray(probs, dtype=np.float32)
        s = probs.sum()
        if s > 0:
            probs = probs / s

        top1_idx = int(np.argmax(probs))
        top1 = {"class": class_names[top1_idx], "confidence": float(probs[top1_idx])}

        top5_idx = np.argsort(probs)[::-1][:5]
        top5 = [{"class": class_names[int(i)], "confidence": float(probs[int(i)])} for i in top5_idx]

        return {"top1": top1, "top5": top5, "num_classes": len(class_names)}
    except HTTPException:
        raise
    except Exception as e:
        # include the exception message for debugging; FastAPI returns this as JSON in "detail"
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

# ---- Chatbot endpoint
@app.post("/api/chat", response_model=ChatOut)
def chat(payload: ChatIn):
    """
    Chatbot endpoint - Multi-language support for health and wellness.
    Supports English, Hindi, Spanish, Arabic, Chinese, and more.
    """
    message = payload.message.lower().strip()
    
    # Detect language and provide appropriate greetings
    # English greetings
    if any(word in message for word in ["hello", "hi", "hey"]):
        return ChatOut(reply="Hi! I'm Caliber. I can help with health tips, nutrition advice, and wellness guidance. What would you like to know? 😊")
    
    # Hindi greetings (हैलो, नमस्ते)
    if any(word in message for word in ["namaste", "namaskar", "नमस्ते", "हैलो"]):
        return ChatOut(reply="नमस्ते! मैं कैलिबर हूं। मैं स्वास्थ्य सलाह और पोषण टिप्स में मदद कर सकता हूं। आप क्या जानना चाहेंगे? 😊\n\nHi! I'm Caliber. I can help with health tips and nutrition advice. What would you like to know?")
    
    # Spanish greetings
    if any(word in message for word in ["hola", "buenos dias", "buenas tardes"]):
        return ChatOut(reply="¡Hola! Soy Caliber. Puedo ayudarte con consejos de salud y nutrición. ¿Qué te gustaría saber? 😊")
    
    # Arabic greetings (مرحبا, السلام عليكم)
    if any(word in message for word in ["marhaba", "salam", "مرحبا", "السلام"]):
        return ChatOut(reply="مرحبا! أنا كاليبر. يمكنني المساعدة في نصائح الصحة والتغذية. ماذا تريد أن تعرف؟ 😊")
    
    # Chinese greetings (你好)
    if any(word in message for word in ["nihao", "你好", "您好"]):
        return ChatOut(reply="你好！我是 Caliber。我可以帮助您了解健康建议和营养知识。您想知道什么？😊")
    
    elif any(word in message for word in ["pcod", "pcos", "polycystic", "पीसीओडी", "पीसीओएस"]):
        return ChatOut(reply="PCOD/PCOS management tips:\n• Maintain healthy weight through balanced diet\n• Exercise regularly (30 min daily)\n• Eat low-glycemic foods, avoid refined carbs\n• Include fiber-rich foods and lean proteins\n• Manage stress through yoga/meditation\n• Get adequate sleep (7-8 hours)\n• Consult a gynecologist for proper treatment\n\nपीसीओडी/पीसीओएस प्रबंधन:\n• संतुलित आहार से स्वस्थ वजन बनाए रखें\n• नियमित व्यायाम करें (30 मिनट रोज़ाना)\n• तनाव प्रबंधन - योग/ध्यान\n• 7-8 घंटे की नींद लें")
    
    elif any(word in message for word in ["thyroid", "hypothyroid", "hyperthyroid", "थायराइड"]):
        return ChatOut(reply="Thyroid health tips:\n• Take prescribed medication regularly\n• Eat selenium-rich foods (Brazil nuts, fish)\n• Include iodine sources (iodized salt, seafood)\n• Avoid excessive soy products\n• Manage stress levels\n• Regular check-ups and blood tests\n• Consult an endocrinologist for treatment")
    
    elif any(word in message for word in ["diabetes", "blood sugar", "insulin", "मधुमेह", "शुगर", "डायबिटीज"]):
        return ChatOut(reply="Diabetes management:\n• Monitor blood sugar regularly\n• Follow a balanced, low-sugar diet\n• Exercise daily (walking, swimming)\n• Take medications as prescribed\n• Control portion sizes\n• Stay hydrated\n• Regular doctor check-ups are essential\n\nमधुमेह प्रबंधन:\n• ब्लड शुगर नियमित चेक करें\n• संतुलित, कम-शक्कर वाला आहार लें\n• रोजाना व्यायाम करें\n• दवाइयाँ समय पर लें")
    
    elif any(word in message for word in ["period", "menstrual", "cramps", "pms", "पीरियड", "माहवारी"]):
        return ChatOut(reply="Period pain relief:\n• Apply heating pad to lower abdomen\n• Light exercise (walking, yoga)\n• Stay hydrated\n• Avoid caffeine and salty foods\n• Take pain relievers if needed\n• Get adequate rest\n• If severe pain persists, consult a doctor\n\nपीरियड दर्द से राहत:\n• पेट के निचले हिस्से पर गर्म पानी की बोतल रखें\n• हल्का व्यायाम करें (चलना, योग)\n• खूब पानी पिएं")
    
    elif any(word in message for word in ["pregnancy", "pregnant", "expecting"]):
        return ChatOut(reply="Pregnancy care basics:\n• Regular prenatal check-ups\n• Take prenatal vitamins (folic acid)\n• Eat nutritious, balanced meals\n• Stay hydrated (8-10 glasses water)\n• Light exercise (with doctor approval)\n• Avoid alcohol, smoking, raw foods\n• Always consult your OB/GYN for guidance")
    
    elif any(word in message for word in ["acne", "pimple", "skin", "breakout"]):
        return ChatOut(reply="Acne management tips:\n• Wash face twice daily with gentle cleanser\n• Don't pick or squeeze pimples\n• Use non-comedogenic products\n• Stay hydrated, eat healthy foods\n• Reduce dairy and sugar intake\n• Manage stress levels\n• See a dermatologist for persistent acne")
    
    elif any(word in message for word in ["hair fall", "hair loss", "baldness"]):
        return ChatOut(reply="Hair fall prevention:\n• Eat protein-rich foods (eggs, nuts, fish)\n• Include biotin and iron in diet\n• Massage scalp regularly\n• Avoid harsh chemicals and heat styling\n• Manage stress through yoga/meditation\n• Stay hydrated\n• Consult a dermatologist if severe")
    
    elif any(word in message for word in ["weight loss", "lose weight", "fat loss"]):
        return ChatOut(reply="Healthy weight loss tips:\n• Create calorie deficit (500 cal/day)\n• Eat whole foods, avoid processed items\n• Exercise 30-60 min daily (cardio + strength)\n• Drink water before meals\n• Get 7-8 hours sleep\n• Track your food intake\n• Be patient - lose 0.5-1 kg per week safely")
    
    elif any(word in message for word in ["weight gain", "gain weight", "underweight"]):
        return ChatOut(reply="Healthy weight gain tips:\n• Eat more frequent meals (5-6 times daily)\n• Include calorie-dense foods (nuts, avocado)\n• Add protein shakes and smoothies\n• Strength training to build muscle\n• Eat healthy fats (olive oil, nuts)\n• Don't skip meals\n• Consult a nutritionist for a meal plan")
    
    elif any(word in message for word in ["headache", "head hurt", "migraine", "सिरदर्द"]):
        return ChatOut(reply="For headaches:\n• Rest in a quiet, dark room\n• Stay hydrated - drink water\n• Apply a cold compress to your forehead\n• Avoid bright screens\n• Take pain reliever if needed\n\nसिरदर्द के लिए:\n• शांत, अंधेरे कमरे में आराम करें\n• खूब पानी पिएं\n• माथे पर ठंडा कपड़ा रखें\n\nIf severe or persistent, please consult a doctor.")
    
    elif any(word in message for word in ["fever", "temperature", "hot", "बुखार"]):
        return ChatOut(reply="For fever:\n• Rest and stay hydrated\n• Take fever-reducing medication if needed\n• Use cool compresses\n• Monitor your temperature\n• Eat light, nutritious food\n\nबुखार के लिए:\n• आराम करें और पानी पिएं\n• बुखार की दवा लें\n• तापमान चेक करते रहें\n\nSee a doctor if fever is above 103°F (39.4°C) or lasts more than 3 days.")
    
    elif any(word in message for word in ["cold", "flu", "cough", "sneeze"]):
        return ChatOut(reply="For cold/flu symptoms:\n• Get plenty of rest\n• Drink warm fluids (tea, soup, water)\n• Use a humidifier\n• Gargle with salt water for sore throat\n• Wash hands frequently\n• Take vitamin C\n\nSee a doctor if symptoms worsen or last more than 10 days.")
    
    elif any(word in message for word in ["stomach", "digestive", "acidity", "gas", "bloating"]):
        return ChatOut(reply="Digestive health tips:\n• Eat smaller, frequent meals\n• Avoid spicy and oily foods\n• Chew food slowly and thoroughly\n• Stay hydrated between meals\n• Include fiber-rich foods\n• Avoid lying down after eating\n• If persistent, consult a gastroenterologist")
    
    elif any(word in message for word in ["constipation", "bowel"]):
        return ChatOut(reply="For constipation relief:\n• Drink plenty of water (8-10 glasses)\n• Eat high-fiber foods (fruits, vegetables, whole grains)\n• Exercise regularly\n• Don't ignore the urge to go\n• Include probiotics (yogurt)\n• Avoid processed foods\n• See a doctor if it persists beyond a week")
    
    elif any(word in message for word in ["diet", "nutrition", "eat", "food", "healthy eating"]):
        return ChatOut(reply="Healthy eating tips:\n• Eat plenty of fruits and vegetables (5 servings daily)\n• Choose whole grains over refined grains\n• Include lean proteins (fish, chicken, beans, eggs)\n• Drink 8 glasses of water daily\n• Limit processed foods and sugar\n• Eat mindfully and control portions\n\nUse our food detection feature to track your meals!")
    
    elif any(word in message for word in ["exercise", "workout", "fitness", "gym"]):
        return ChatOut(reply="Exercise recommendations:\n• Aim for 30 minutes of activity daily\n• Mix cardio (walking, running, cycling) with strength training\n• Start slow and increase gradually\n• Stay consistent - even light activity helps\n• Warm up before and cool down after\n• Listen to your body\n\nConsult a doctor before starting a new exercise program.")
    
    elif any(word in message for word in ["sleep", "insomnia", "tired", "fatigue"]):
        return ChatOut(reply="Better sleep tips:\n• Stick to a consistent sleep schedule\n• Avoid screens 1 hour before bed\n• Keep your bedroom cool and dark\n• Avoid caffeine after 2 PM\n• Try relaxation techniques or meditation\n• Don't eat heavy meals before bed\n\nAdults need 7-9 hours of sleep per night.")
    
    elif any(word in message for word in ["stress", "anxiety", "worried", "nervous", "depression"]):
        return ChatOut(reply="Mental health management:\n• Practice deep breathing exercises\n• Take regular breaks during work\n• Exercise regularly (releases endorphins)\n• Talk to friends, family, or a therapist\n• Try meditation, yoga, or journaling\n• Maintain a routine\n\nIf anxiety/depression is severe, seek professional help immediately.")
    
    elif any(word in message for word in ["water", "hydration", "drink"]):
        return ChatOut(reply="Hydration guidelines:\n• Drink 8-10 glasses (2-2.5 liters) of water daily\n• More if exercising or in hot weather\n• Urine should be light yellow\n• Don't wait until you're thirsty\n• Eat water-rich foods (cucumber, watermelon)\n• Limit sugary drinks and alcohol")
    
    elif any(word in message for word in ["vitamin", "supplement", "nutrient"]):
        return ChatOut(reply="About vitamins and supplements:\n• Best to get nutrients from whole foods first\n• Common supplements: Vitamin D, B12, Omega-3, Iron\n• Consult a doctor before starting supplements\n• Too much can be harmful\n• Focus on a balanced diet\n• Blood tests can show if you're deficient")
    
    elif any(word in message for word in ["blood pressure", "bp", "hypertension"]):
        return ChatOut(reply="Blood pressure management:\n• Reduce salt intake (under 5g daily)\n• Exercise regularly (30 min daily)\n• Maintain healthy weight\n• Limit alcohol and quit smoking\n• Eat potassium-rich foods (bananas, spinach)\n• Manage stress levels\n• Take prescribed medication regularly")
    
    elif any(word in message for word in ["cholesterol", "heart health"]):
        return ChatOut(reply="Heart health and cholesterol:\n• Eat omega-3 rich foods (fish, walnuts)\n• Avoid trans fats and fried foods\n• Include fiber (oats, beans, apples)\n• Exercise regularly\n• Maintain healthy weight\n• Quit smoking\n• Regular check-ups and lipid profile tests")
    
    elif any(word in message for word in ["immunity", "immune system"]):
        return ChatOut(reply="Boost immunity naturally:\n• Eat vitamin C rich foods (citrus, berries)\n• Include zinc sources (nuts, seeds)\n• Get adequate sleep (7-9 hours)\n• Exercise regularly\n• Manage stress\n• Stay hydrated\n• Avoid smoking and excessive alcohol")
    
    elif "thank" in message or "thanks" in message:
        return ChatOut(reply="You're welcome! Stay healthy and feel free to ask if you need more wellness tips! 😊")
    
    else:
        return ChatOut(reply="I'm here to help with health and wellness questions! Ask me about:\n• Women's health (PCOD/PCOS, periods, pregnancy)\n• Common conditions (diabetes, thyroid, BP)\n• Symptoms (headache, fever, cold, stomach issues)\n• Nutrition, diet, and weight management\n• Exercise, fitness, and sleep\n• Skin, hair, and mental health\n\nWhat would you like to know?")

# ---- Start server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
