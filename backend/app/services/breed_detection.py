# ============================================================
# PAWSENSE - BREED DETECTION SERVICE
# ============================================================

import os
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model


# ============================================================
# MODEL PATH
# ============================================================

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "models",
    "breed_model_new_correct_phase2_best.keras"
)


# ============================================================
# LOAD MODEL
# ============================================================

print("=" * 60)
print("PAWSENSE BREED DETECTION")
print("=" * 60)

print(f"Loading model from:\n{MODEL_PATH}")

model = load_model(
    MODEL_PATH,
    compile=False
)

print("Breed detection model loaded successfully ✅")


# ============================================================
# 24 BREED CLASSES
# ============================================================

CLASS_NAMES = [
    "Cat_Abyssinian cat",
    "Cat_British Shorthair cat",
    "Cat_Norwegian Forest Cat",
    "Cat_Oriental Shorthair Cat",
    "Cat_Ragdoll cat",
    "Cat_Russian Blue Cat",
    "Cat_Siamese cat",
    "Cat_Sphynx cat",
    "Cat_bengal cat",
    "Cat_bombay cat",
    "Cat_egyptian mau cat",
    "Cat_maine coon cat",
    "Cat_manx cat",
    "Cat_persian cat",
    "Cat_turkish van cat",
    "Dog_beagle",
    "Dog_bulldog",
    "Dog_dalmatian",
    "Dog_german-shepherd",
    "Dog_golden-retriever",
    "Dog_husky",
    "Dog_labrador-retriever",
    "Dog_poodle",
    "Dog_rottweiler"
]


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_breed(image: Image.Image):

    # Convert image to RGB
    image = image.convert("RGB")

    # Resize to model input size
    image = image.resize((224, 224))

    # Convert to NumPy array
    image_array = np.array(
        image,
        dtype=np.float32
    )

    # Add batch dimension
    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    # IMPORTANT:
    # Do NOT divide by 255.
    # The trained EfficientNet pipeline expects
    # the original 0-255 image range.

    # Prediction
    predictions = model.predict(
        image_array,
        verbose=0
    )[0]

    # Highest probability
    predicted_index = int(
        np.argmax(predictions)
    )

    confidence = float(
        predictions[predicted_index] * 100
    )

    predicted_breed = CLASS_NAMES[
        predicted_index
    ]

    # Return result
    return {
        "breed": predicted_breed,
        "confidence": round(
            confidence,
            2
        )
    }