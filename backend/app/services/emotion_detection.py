from pathlib import Path

from pawsense_vocal_ai.generalized_predictor import (
    PawSenseGeneralizedPredictor,
)


# ---------------------------------------------------------
# Model path
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "pawsense_portable_model.npz"
)


# ---------------------------------------------------------
# Load predictor ONCE when backend starts
# ---------------------------------------------------------

predictor = PawSenseGeneralizedPredictor(
    MODEL_PATH,
    strict=True,
    allow_legacy_fallback=True,
)


# ---------------------------------------------------------
# Emotion prediction
# ---------------------------------------------------------

def predict_emotion(audio_path: str):
    """
    Run PawSense emotion detection on an audio file.

    The model is already loaded when the backend starts.
    It is NOT loaded again for every request.
    """

    result = predictor.predict(audio_path)

    return result