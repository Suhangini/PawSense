import os
import json
import numpy as np
import tensorflow as tf


# ==========================================
# PATHS
# ==========================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "final_food_model.keras"
)

CONFIG_PATH = os.path.join(
    BASE_DIR,
    "models",
    "food_model_config.json"
)


# ==========================================
# LOAD CONFIGURATION
# ==========================================

with open(CONFIG_PATH, "r") as f:
    config = json.load(f)


IMG_SIZE = config["image_size"]

index_to_food = {
    int(index): food
    for index, food in config["classes"].items()
}

food_to_index = {
    food: index
    for index, food in index_to_food.items()
}

toxicity_map = config["toxicity"]

FINAL_TOXIC_THRESHOLD = config["toxicity_threshold"]


# ==========================================
# TOXIC FOOD LIST
# ==========================================

toxic_foods = [
    food
    for food, status in toxicity_map.items()
    if status == "TOXIC"
]


# ==========================================
# LOAD MODEL
# ==========================================

print("Loading Food Detection Model...")

food_model = tf.keras.models.load_model(
    MODEL_PATH
)

print("Food Detection Model loaded successfully! ✅")


# ==========================================
# FOOD PREDICTION FUNCTION
# ==========================================

def predict_food(image):
    """
    Predict food type and toxicity from a PIL image.
    """

    # --------------------------------------
    # Resize image
    # --------------------------------------

    image = image.convert("RGB")
    image = image.resize((IMG_SIZE, IMG_SIZE))


    # --------------------------------------
    # Convert image to NumPy array
    # --------------------------------------

    image_array = np.array(
        image,
        dtype=np.float32
    )


    # --------------------------------------
    # Add batch dimension
    # --------------------------------------

    image_array = np.expand_dims(
        image_array,
        axis=0
    )


    # --------------------------------------
    # Model prediction
    # --------------------------------------

    probabilities = food_model.predict(
        image_array,
        verbose=0
    )[0]


    # --------------------------------------
    # Most likely food
    # --------------------------------------

    predicted_index = int(
        np.argmax(probabilities)
    )

    predicted_food = index_to_food[
        predicted_index
    ]


    # --------------------------------------
    # Food confidence
    # --------------------------------------

    food_confidence = float(
        probabilities[predicted_index]
    )


    # --------------------------------------
    # Calculate toxic probability
    # --------------------------------------

    toxic_probability = float(
        sum(
            probabilities[
                food_to_index[food]
            ]
            for food in toxic_foods
        )
    )


    # --------------------------------------
    # Final toxicity decision
    # --------------------------------------

    if toxic_probability >= FINAL_TOXIC_THRESHOLD:
        toxicity = "TOXIC"
    else:
        toxicity = "SAFE"


    # --------------------------------------
    # Return result
    # --------------------------------------

    return {
        "food": predicted_food,
        "food_confidence": food_confidence,
        "toxic_probability": toxic_probability,
        "toxicity": toxicity
    }