"""Pickle-free NumPy inference for the PawSense vocal model."""

from __future__ import annotations

from pathlib import Path

import numpy as np

from .audio_features import FEATURE_NAMES, extract_features, feature_dict


EMOTION_NAMES = [
    "happy_playful",
    "calm_content",
    "anxious_distressed",
    "alert_defensive",
]

DISPLAY_LABELS = {
    "cat": {
        "happy_playful": "Happy / social",
        "calm_content": "Calm / content",
        "anxious_distressed": "Anxious / distressed",
        "alert_defensive": "Defensive / agitated",
    },
    "dog": {
        "happy_playful": "Happy / playful",
        "calm_content": "Calm / content",
        "anxious_distressed": "Anxious / distressed",
        "alert_defensive": "Alert / defensive",
    },
}

GUIDANCE = {
    "happy_playful": (
        "The vocal pattern is energetic and comparatively tonal. Look for loose posture, "
        "play bows, relaxed ears or friendly social behaviour before confirming."
    ),
    "calm_content": (
        "The sound has a lower-arousal acoustic profile. Continue observing body posture "
        "and the surrounding situation."
    ),
    "anxious_distressed": (
        "The sound contains instability or high-pitched/noisy cues associated with possible "
        "distress. Check the environment, distance from stressors and visible discomfort."
    ),
    "alert_defensive": (
        "The sound has strong alert or defensive acoustic cues. Give the animal space and "
        "check for unfamiliar people, animals or other triggers."
    ),
}


class PawSenseVocalPredictor:
    """Run the exported PawSense forest and cluster models with NumPy only."""

    def __init__(self, model_path: str | Path):
        self.model_path = Path(model_path)
        with np.load(self.model_path, allow_pickle=False) as archive:
            self.model = {name: archive[name].copy() for name in archive.files}

        if int(self.model["format_version"][0]) != 1:
            raise RuntimeError("Unsupported portable PawSense model format")
        if self.model["feature_schema"].tolist() != FEATURE_NAMES:
            raise RuntimeError("Model and feature extractor schemas do not match")

        self.bundle = {
            "bundle_version": str(self.model["bundle_version"][0]),
            "training_samples": int(self.model["training_samples"][0]),
            "species_counts": {
                "cat": int(self.model["species_counts"][0]),
                "dog": int(self.model["species_counts"][1]),
            },
            "runtime": "portable_numpy",
        }

    @staticmethod
    def _sigmoid(value: float) -> float:
        return float(1.0 / (1.0 + np.exp(-np.clip(value, -20.0, 20.0))))

    def _species_probabilities(self, vector: np.ndarray) -> np.ndarray:
        offsets = self.model["tree_offsets"]
        left = self.model["tree_left"]
        right = self.model["tree_right"]
        feature = self.model["tree_feature"]
        threshold = self.model["tree_threshold"]
        probability = self.model["tree_probability"]
        combined = np.zeros(probability.shape[1], dtype=np.float64)

        for tree_index in range(offsets.size - 1):
            base = int(offsets[tree_index])
            node = 0
            while True:
                absolute_node = base + node
                left_child = int(left[absolute_node])
                if left_child < 0:
                    combined += probability[absolute_node]
                    break
                split_feature = int(feature[absolute_node])
                if vector[split_feature] <= threshold[absolute_node]:
                    node = left_child
                else:
                    node = int(right[absolute_node])

        combined /= max(1, offsets.size - 1)
        total = float(np.sum(combined))
        return combined / total if total > 0 else np.full_like(combined, 1.0 / combined.size)

    def _emotion_prediction(self, vector: np.ndarray, species: str) -> dict:
        prefix = f"{species}_"
        indices = self.model[prefix + "feature_indices"].astype(int)
        selected = vector[indices]
        scale = np.where(self.model[prefix + "scaler_scale"] == 0, 1.0, self.model[prefix + "scaler_scale"])
        standardized = (selected - self.model[prefix + "scaler_center"]) / scale
        embedded = (standardized - self.model[prefix + "pca_mean"]) @ self.model[prefix + "pca_components"].T
        centers = self.model[prefix + "cluster_centers"]
        distances = np.linalg.norm(centers - embedded[None, :], axis=1)
        order = np.argsort(distances)
        cluster = int(order[0])
        nearest, second = float(distances[order[0]]), float(distances[order[1]])
        margin = max(0.0, (second - nearest) / (second + 1e-9))
        radius = float(self.model[prefix + "cluster_radii"][cluster])
        closeness = float(np.exp(-nearest / (2.0 * max(radius, 1e-9))))
        confidence = float(np.clip(0.25 + 0.45 * closeness + 0.30 * margin, 0.20, 0.95))

        arousal_linear = float(np.dot(standardized, self.model[prefix + "arousal_weights"]))
        arousal_score = round(100.0 * self._sigmoid(arousal_linear), 1)
        arousal_level = "low" if arousal_score < 40 else "high" if arousal_score >= 67 else "moderate"
        emotion_code = int(self.model[prefix + "cluster_emotion_codes"][cluster])

        return {
            "state": EMOTION_NAMES[emotion_code],
            "emotion_confidence": confidence,
            "arousal_score": arousal_score,
            "arousal_level": arousal_level,
        }

    def predict(self, audio_path: str | Path) -> dict:
        vector = extract_features(audio_path)
        probabilities = self._species_probabilities(vector)
        classes = self.model["species_classes"].tolist()
        species_index = int(np.argmax(probabilities))
        species = str(classes[species_index])
        species_confidence = float(probabilities[species_index])

        emotion = self._emotion_prediction(vector, species)
        combined_confidence = float(
            np.clip(species_confidence * emotion["emotion_confidence"], 0.0, 0.95)
        )
        uncertain = bool(species_confidence < 0.58 or combined_confidence < 0.42)
        state = emotion["state"]
        display = DISPLAY_LABELS[species][state]
        features = feature_dict(vector)
        if uncertain:
            display = f"Uncertain — closest match: {display}"

        return {
            "species": species,
            "species_display": "Cat" if species == "cat" else "Dog",
            "species_confidence": round(species_confidence, 4),
            "estimated_state": state,
            "estimated_state_display": display,
            "confidence": round(combined_confidence, 4),
            "uncertain": uncertain,
            "acoustic_profile": {
                "duration_seconds": round(features["duration"], 2),
                "dominant_pitch_hz": round(features["pitch_mean"], 1),
                "arousal": emotion["arousal_level"],
                "arousal_score": emotion["arousal_score"],
                "tonality": "tonal" if features["tonality_mean"] >= 2.0 else "rough/noisy",
            },
            "guidance": GUIDANCE[state],
            "safety_note": (
                "This is an acoustic estimate, not a translation or medical diagnosis. "
                "Use body language and context; contact a veterinarian for persistent "
                "distress, pain, breathing difficulty or sudden behavioural change."
            ),
            "model_version": self.bundle["bundle_version"],
        }

