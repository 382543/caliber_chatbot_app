#!/usr/bin/env python3
# model.py — robust prediction script (fixed and improved)

import os
# set env BEFORE importing TF/keras if you need to control backend/options
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["KERAS_BACKEND"] = "tensorflow"

import argparse
from pathlib import Path
import numpy as np
import tensorflow as tf
from tensorflow import keras
import cv2

# === your class names (kept from your list) ===
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

def load_model(model_path: str):
    p = Path(model_path)
    if not p.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")
    model = keras.models.load_model(str(p), compile=False)
    print("Model loaded successfully.")
    print(f"Model input shape: {model.input_shape}")
    return model

def preprocess_image(image_path: str, target_size=(256, 256), target_channels=3):
    # read image (BGR)
    img = cv2.imread(str(image_path), cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ValueError(f"Could not load image from {image_path}")

    # handle alpha / gray / single-channel
    if img.ndim == 2:
        # grayscale -> convert to 3-channel if required
        if target_channels == 3:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    else:
        # img.ndim == 3
        ch = img.shape[2]
        if ch == 4:
            # drop alpha
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
        elif ch == 1:
            # rare OpenCV case: convert to BGR
            if target_channels == 3:
                img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    # ensure channels: convert BGR->RGB for 3-channel input (many Keras models expect RGB)
    if target_channels == 3:
        if img.ndim == 3 and img.shape[2] == 3:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        elif img.ndim == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
    else:
        # single channel expected
        if img.ndim == 3:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # resize (target_size is (h,w))
    th, tw = target_size
    img = cv2.resize(img, (tw, th), interpolation=cv2.INTER_LINEAR)

    # scale to [0,1] (adjust if your model uses different preprocessing)
    img = img.astype("float32") / 255.0

    # ensure channel dim present
    if img.ndim == 2:
        img = np.expand_dims(img, axis=-1)

    # add batch dim
    img = np.expand_dims(img, axis=0)
    return img

def predict_food_class(model, image_path, topk=1):
    # infer model input shape (if available)
    input_shape = model.input_shape  # e.g., (None, H, W, C)
    target_size = (256, 256)
    target_channels = 3
    if input_shape is not None:
        try:
            # handle (None, h, w, c) or (h, w, c)
            if len(input_shape) == 4:
                _, h, w, c = input_shape
            elif len(input_shape) == 3:
                h, w, c = input_shape
            else:
                h = w = c = None
            if h is not None and w is not None:
                target_size = (int(h), int(w))
            if c in (1, 3):
                target_channels = int(c)
        except Exception:
            pass

    img = preprocess_image(image_path, target_size=target_size, target_channels=target_channels)
    preds = model.predict(img)
    preds = np.asarray(preds)

    # handle scalar/regression-like output
    if preds.ndim == 1 and preds.shape[0] == 1:
        return [("score", float(preds[0]), 0)], preds

    # typical (1, num_classes)
    if preds.ndim == 2 and preds.shape[0] == 1:
        logits = preds[0]
    else:
        logits = preds.reshape(-1)

    # if not normalized, softmax
    if not np.allclose(logits.sum(), 1.0, atol=1e-3):
        probs = tf.nn.softmax(logits).numpy()
    else:
        probs = logits

    topk = max(1, int(topk))
    top_idx = np.argsort(probs)[::-1][:topk]
    results = []
    for i in top_idx:
        name = class_names[i] if i < len(class_names) else str(i)
        results.append((name, float(probs[i]), int(i)))
    return results, probs

def main():
    parser = argparse.ArgumentParser(description="Predict food class from image using a Keras model.")
    parser.add_argument("--model", "-m", required=True, help="Path to .keras/.h5 model file")
    parser.add_argument("--image", "-i", required=True, help="Path to input image")
    parser.add_argument("--topk", "-k", default=1, type=int, help="Show top-K predictions")
    args = parser.parse_args()

    model = load_model(args.model)
    try:
        results, probs = predict_food_class(model, args.image, topk=args.topk)
    except Exception as e:
        print(f"Error during prediction: {e}")
        return

    print("\nTop predictions:")
    for name, prob, idx in results:
        print(f"  [{idx}] {name} — {prob:.4f}")

if __name__ == "__main__":
    main()
