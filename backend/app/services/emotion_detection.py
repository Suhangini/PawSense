
from pathlib import Path

from pawsense_vocal_ai.generalized_predictor import (
    PawSenseGeneralizedPredictor,
)

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR / "models" / "pawsense_portable_model.npz"

predictor = None


def get_predictor():
    global predictor

    if predictor is None:
        print("Initializing PawSense emotion predictor...", flush=True)

        predictor = PawSenseGeneralizedPredictor(
            MODEL_PATH,
            strict=True,
            allow_legacy_fallback=True,
        )

        print("PawSense emotion predictor initialized.", flush=True)

    return predictor


def predict_emotion(audio_path: str):
    return get_predictor().predict(audio_path)
