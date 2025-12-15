#!/usr/bin/env python
"""
Training script for food classification model using Python 3.11
This bypasses the notebook to avoid Python 3.13 issues
"""

print("Starting training with Python 3.11...")
import sys
print(f"Python version: {sys.version}")

# Import required libraries
import pandas as pd
import os
import numpy as np
import tensorflow as tf
import cv2

print(" Libraries imported successfully")

# Download dataset
import kagglehub
print("Downloading dataset from Kaggle...")
bjoernjostein_food_classification_path = kagglehub.dataset_download('bjoernjostein/food-classification')
print(f" Dataset downloaded to: {bjoernjostein_food_classification_path}")

# Load training data
training_dataframe = pd.read_csv(f"{bjoernjostein_food_classification_path}/train_img.csv")
print(f" Loaded training data: {training_dataframe.shape}")

# Prepare data
class_names = pd.get_dummies(training_dataframe["ClassName"]).columns
y_dev = np.asarray(pd.get_dummies(training_dataframe["ClassName"]))
X_dev = np.asarray(training_dataframe["ImageId"])
train_path = f"{bjoernjostein_food_classification_path}/train_images/train_images/"

print(f"Classes: {len(class_names)}, Samples: {len(X_dev)}")

# Data generators
def generate_data(filelist, img_path, target):
    while True:
        for i, j in enumerate(filelist):
            X_train = cv2.imread(img_path + j, cv2.IMREAD_COLOR)
            X_train = cv2.resize(X_train, (256, 256), interpolation=cv2.INTER_LINEAR)
            y_train = target[i]
            yield X_train, y_train

def batch_generator(batch_size, gen_x):
    batch_features = np.zeros((batch_size, 256, 256, 3))
    batch_labels = np.zeros((batch_size, 61))
    while True:
        for i in range(batch_size):
            batch_features[i], batch_labels[i] = next(gen_x)
        yield batch_features, batch_labels

print(" Data generators created")

# Create model
def create_model():
    base_model = tf.keras.applications.EfficientNetB1(
        weights=None,  # Don't load ImageNet weights to avoid compatibility issues
        include_top=False, input_shape=(256, 256, 3)
    )
    num_classes = 61

    x = base_model.output
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    predictions = tf.keras.layers.Dense(num_classes, activation='softmax')(x)
    model = tf.keras.Model(inputs=base_model.input, outputs=predictions)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss="categorical_crossentropy",
        metrics=['acc']
    )
    return model

print("Creating model with EfficientNetB1...")
model = create_model()
print("✓ Model created successfully")
print(f"Total parameters: {model.count_params():,}")

# Train model
batch_size = 64
num_epoch = 5

print(f"\nStarting training: {num_epoch} epochs, batch size {batch_size}")
print("This will take approximately 10-20 minutes...\n")

history = model.fit(
    x=batch_generator(batch_size, generate_data(X_dev, train_path, y_dev)),
    epochs=num_epoch,
    steps_per_epoch=int(y_dev.shape[0] / batch_size),
    verbose=1
)

print("\n Training completed!")

# Save model to backend folder
backend_folder = os.path.join(os.path.dirname(os.getcwd()), 'backend')
if not os.path.exists(backend_folder):
    backend_folder = os.path.join(os.getcwd(), 'backend')

save_path = os.path.join(backend_folder, 'food_classification_model.keras')
print(f"\nSaving model to: {save_path}")
model.save(save_path, save_format='keras')
print(" Model saved successfully!")

print("\n" + "="*60)
print("TRAINING COMPLETE!")
print("="*60)
print(f"Model saved to: {save_path}")
print("\nNext steps:")
print("1. Stop your backend server (Ctrl+C)")
print("2. Restart it: cd backend && python app.py")
print("3. Test the food detection in your web app")
