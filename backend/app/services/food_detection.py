import os
import json
import numpy as np
import tensorflow as tf

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR, "models", "final_food_model.keras"
)

CONFIG_PATH = os.path.join(
    BASE_DIR, "models", "food_model_config.json"
)

with open(CONFIG_PATH, "r") as f:
    config = json.load(f)

IMG_SIZE = config["image_size"]

index_to_food = {
    int(index): food
    for index, food in config["classes"].items()
}

food_to_index = {
    food: index for index, food in index_to_food.items()
}

toxicity_map = config["toxicity"]
FINAL_TOXIC_THRESHOLD = config["toxicity_threshold"]

toxic_foods = [
    food for food, status in toxicity_map.items()
    if status == "TOXIC"
]

food_model = None

def get_food_model():
    global food_model

    if food_model is None:
        print(f"Loading food model: {MODEL_PATH}")
        food_model = tf.keras.models.load_model(
            MODEL_PATH,
            compile=False
        )
        print("Food model loaded successfully!")

    return food_model

def predict_food(image):
    image = image.convert("RGB")
    image = image.resize((IMG_SIZE, IMG_SIZE))

    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)

    probabilities = get_food_model().predict(
        image_array,
        verbose=0
    )[0]

    predicted_index = int(np.argmax(probabilities))
    predicted_food = index_to_food[predicted_index]

    food_confidence = float(probabilities[predicted_index])

    toxic_probability = float(sum(
        probabilities[food_to_index[food]]
        for food in toxic_foods
    ))

    toxicity = (
        "TOXIC"
        if toxic_probability >= FINAL_TOXIC_THRESHOLD
        else "SAFE"
    )

    return {
        "food": predicted_food,
        "food_confidence": food_confidence,
        "toxic_probability": toxic_probability,
        "toxicity": toxicity
    }