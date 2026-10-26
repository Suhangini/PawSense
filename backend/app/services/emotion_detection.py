

from pathlib import Path

import joblib
import librosa
import numpy as np

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR / "models" / "pawsense_svm_delta_tuned.joblib"

# Load the shared SVM pipeline once.
model = joblib.load(MODEL_PATH)


def predict_emotion(audio_path: str):
    audio, sr = librosa.load(audio_path, sr=22050, mono=True)

    mfcc = librosa.feature.mfcc(
        y=audio,
        sr=sr,
        n_mfcc=40,
        n_fft=2048,
        hop_length=512,
    )

    n_frames = mfcc.shape[1]
    width = min(9, n_frames if n_frames % 2 else n_frames - 1)

    if width < 3:
        delta = np.zeros_like(mfcc)
        delta2 = np.zeros_like(mfcc)
    else:
        delta = librosa.feature.delta(
            mfcc, width=width, order=1, mode="nearest"
        )
        delta2 = librosa.feature.delta(
            mfcc, width=width, order=2, mode="nearest"
        )

    features = np.concatenate([
        mfcc.mean(axis=1), mfcc.std(axis=1),
        delta.mean(axis=1), delta.std(axis=1),
        delta2.mean(axis=1), delta2.std(axis=1),
    ]).astype(np.float32).reshape(1, -1)

    if features.shape[1] != 240:
        raise ValueError(f"Expected 240 features, got {features.shape[1]}")

    emotion = str(model.predict(features)[0])
    result = {"emotion": emotion}

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(features)[0]
        result["probabilities"] = {
            str(label): round(float(prob), 4)
            for label, prob in zip(model.classes_, probabilities)
        }

    return result
