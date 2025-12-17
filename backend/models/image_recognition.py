import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import os

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "karnataka_model.keras")
model = tf.keras.models.load_model(MODEL_PATH)

# Define the class labels (same order as training)
CLASS_NAMES = [
    'agumbe', 'badami', 'bandipur_national_park', 'bannerghatta_national_park', 'belur',
    'bijapur_gol_gumbaz', 'br_hills', 'chikmagalur', 'coorg', 'cubbon_park', 'dandeli',
    'dharmasthala', 'gokarna', 'halebidu', 'hampi', 'jog_falls', 'kabbaladurga', 'karwar',
    'kolar_gold_fields', 'kudremukh', 'lalbagh', 'murudeshwar', 'mysore_palace', 'nandi_hills',
    'pattadakal', 'shimoga', 'shravanabelagola', 'somnathpur', 'sringeri', 'udupi'
]

def predict_image(img_path):
    """Takes image path and returns predicted label + confidence."""
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0

    predictions = model.predict(img_array)
    class_idx = np.argmax(predictions)
    confidence = round(np.max(predictions) * 100, 2)

    return {
        "predicted_place": CLASS_NAMES[class_idx],
        "confidence": confidence
    }
