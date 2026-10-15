import os
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "models",
    "breed_model_new_correct_phase2_best.keras"
)

model = None

def get_model():
    global model
    if model is None:
        print(f"Loading breed model: {MODEL_PATH}")
        model = load_model(MODEL_PATH, compile=False)
        print("Breed model loaded successfully!")
    return model

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

def predict_breed(image: Image.Image):
    image = image.convert("RGB").resize((224, 224))
    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)

    predictions = get_model().predict(image_array, verbose=0)[0]
    predicted_index = int(np.argmax(predictions))

    return {
        "breed": CLASS_NAMES[predicted_index],
        "confidence": round(float(predictions[predicted_index]) * 100, 2)
    }