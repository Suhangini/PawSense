"""Cross-source cat/dog vocalization detection for PawSense.

The species gate uses Google's AudioSet-trained YAMNet model across every
short-time frame in the clip.  The original PawSense acoustic model is kept as
an independent verifier and as the state-estimation model.  In strict mode the
detector is allowed to answer ``unknown`` instead of forcing every sound to be
a cat or dog; this is essential when precision matters.

YAMNet is loaded lazily, so importing this module does not require TensorFlow.
Google Colab normally supplies TensorFlow and the notebook installs only the
small ``tensorflow-hub`` loader if it is missing.
"""

from __future__ import annotations

import csv
import os
from pathlib import Path
from typing import Any, Iterable

import numpy as np

from .audio_features import extract_features, feature_dict, load_wav
from .portable_predictor import DISPLAY_LABELS, GUIDANCE, PawSenseVocalPredictor


YAMNET_URL = "https://tfhub.dev/google/yamnet/1"

# Generic growls/hisses can come from several animals, so they are deliberately
# given little or no species-discriminating weight.  Parent + subtype evidence
# is aggregated per frame instead of treating YAMNet as a single-label model.
DOG_LABEL_WEIGHTS = {
    "Dog": 1.00,
    "Bark": 1.00,
    "Yip": 0.95,
    "Bow-wow": 1.00,
    "Whimper (dog)": 0.95,
    "Howl": 0.45,
}

CAT_LABEL_WEIGHTS = {
    "Cat": 1.00,
    "Meow": 1.00,
    "Purr": 1.00,
    "Caterwaul": 0.90,
    "Hiss": 0.45,
}

NON_COMPETING_PARENT_LABELS = {
    "Animal",
    "Domestic animals, pets",
    "Wild animals",
    "Canidae, dogs, wolves",
    "Livestock, farm animals, working animals",
}

SAFETY_NOTE = (
    "This is an acoustic estimate, not a translation or medical diagnosis. "
    "Use body language and context; contact a veterinarian for persistent "
    "distress, pain, breathing difficulty or sudden behavioural change."
)


class YAMNetUnavailable(RuntimeError):
    """Raised when the cross-source AudioSet engine cannot be loaded."""


def _as_numpy(value: Any) -> np.ndarray:
    if hasattr(value, "numpy"):
        value = value.numpy()
    return np.asarray(value)


class PawSenseGeneralizedPredictor:
    """High-precision cat/dog detector with an explicit unknown class.

    Parameters
    ----------
    legacy_model_path:
        Portable PawSense ``.npz`` model used as an independent verifier and
        for the four acoustic state estimates.
    strict:
        When true, ambiguous or weak pet evidence is returned as ``unknown``.
        This favors precision over forcing a prediction on every clip.
    yamnet_model, class_names:
        Optional injected runtime used by tests.  Normal Colab usage leaves
        both as ``None`` and the official TensorFlow Hub model is loaded.
    allow_legacy_fallback:
        Keep the old detector usable if YAMNet cannot be downloaded.  Results
        clearly identify this reduced-generalization mode.
    """

    def __init__(
        self,
        legacy_model_path: str | Path,
        *,
        strict: bool = True,
        yamnet_model: Any | None = None,
        class_names: Iterable[str] | None = None,
        allow_legacy_fallback: bool = True,
    ) -> None:
        self.legacy = PawSenseVocalPredictor(legacy_model_path)
        self.strict = bool(strict)
        self.allow_legacy_fallback = bool(allow_legacy_fallback)
        self.yamnet = yamnet_model
        self.class_names = list(class_names) if class_names is not None else None
        self.yamnet_error: str | None = None

        if self.yamnet is None:
            try:
                self.yamnet, self.class_names = self._load_yamnet()
            except Exception as exc:
                self.yamnet_error = str(exc)
                if not self.allow_legacy_fallback:
                    raise

        if self.yamnet is not None:
            if not self.class_names:
                raise ValueError("YAMNet class names are required")
            missing = {"Dog", "Cat"}.difference(self.class_names)
            if missing:
                raise ValueError(f"YAMNet class map is missing: {sorted(missing)}")

        self.bundle = {
            **self.legacy.bundle,
            "bundle_version": "2.0.0",
            "species_engine": (
                "AudioSet YAMNet + PawSense verifier"
                if self.yamnet is not None
                else "PawSense legacy fallback"
            ),
            "precision_mode": "strict" if self.strict else "balanced",
            "unknown_rejection": True,
        }

    @staticmethod
    def _load_yamnet() -> tuple[Any, list[str]]:
        os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
        try:
            import tensorflow as tf
        except Exception as exc:  # pragma: no cover - depends on Colab runtime
            raise YAMNetUnavailable(
                "TensorFlow is unavailable. Use a standard Google Colab Python runtime."
            ) from exc
        try:
            import tensorflow_hub as hub
        except Exception as exc:  # pragma: no cover - depends on Colab runtime
            raise YAMNetUnavailable(
                "tensorflow-hub is unavailable. Run the notebook setup cell first."
            ) from exc

        try:
            model = hub.load(YAMNET_URL)
            class_map_path = _as_numpy(model.class_map_path()).item()
            if isinstance(class_map_path, bytes):
                class_map_path = class_map_path.decode("utf-8")
            with tf.io.gfile.GFile(class_map_path, "r") as handle:
                class_names = [row["display_name"] for row in csv.DictReader(handle)]
        except Exception as exc:  # pragma: no cover - network/runtime dependent
            raise YAMNetUnavailable(
                "Could not load the official YAMNet model. Check Colab internet access "
                "and rerun the model-loading cell."
            ) from exc
        return model, class_names

    def _label_indices(self, weights: dict[str, float]) -> list[tuple[int, float, str]]:
        assert self.class_names is not None
        by_name = {name: index for index, name in enumerate(self.class_names)}
        return [
            (by_name[name], weight, name)
            for name, weight in weights.items()
            if name in by_name
        ]

    @staticmethod
    def _group_frame_scores(
        scores: np.ndarray, indices: list[tuple[int, float, str]]
    ) -> np.ndarray:
        if not indices:
            return np.zeros(scores.shape[0], dtype=np.float64)
        values = np.column_stack(
            [scores[:, index] * weight for index, weight, _ in indices]
        )
        values.sort(axis=1)
        strongest = values[:, -1]
        second = values[:, -2] if values.shape[1] > 1 else 0.0
        return np.clip(strongest + 0.20 * second, 0.0, 1.0)

    @staticmethod
    def _aggregate_frames(frame_scores: np.ndarray) -> float:
        frame_scores = np.asarray(frame_scores, dtype=np.float64)
        if frame_scores.size == 0:
            return 0.0
        top_count = max(1, int(np.ceil(frame_scores.size * 0.25)))
        top_mean = float(np.mean(np.sort(frame_scores)[-top_count:]))
        high_quantile = float(np.quantile(frame_scores, 0.90))
        coverage = float(np.mean(frame_scores >= 0.05))
        return float(np.clip(0.55 * high_quantile + 0.35 * top_mean + 0.10 * coverage, 0.0, 1.0))

    def _event_summary(self, scores: np.ndarray, limit: int = 5) -> list[dict]:
        assert self.class_names is not None
        strengths = 0.65 * np.quantile(scores, 0.90, axis=0) + 0.35 * np.mean(scores, axis=0)
        order = np.argsort(strengths)[::-1][:limit]
        return [
            {"label": self.class_names[int(index)], "score": round(float(strengths[index]), 4)}
            for index in order
            if strengths[index] >= 0.005
        ]

    @staticmethod
    def _audio_quality(waveform: np.ndarray, sample_rate: int) -> dict:
        waveform = np.asarray(waveform, dtype=np.float64)
        duration = waveform.size / float(sample_rate)
        peak = float(np.max(np.abs(waveform))) if waveform.size else 0.0
        rms = float(np.sqrt(np.mean(np.square(waveform)))) if waveform.size else 0.0
        clipping_ratio = float(np.mean(np.abs(waveform) >= 0.995)) if waveform.size else 0.0

        frame_size = max(1, int(0.025 * sample_rate))
        hop = max(1, int(0.010 * sample_rate))
        if waveform.size >= frame_size:
            starts = np.arange(0, waveform.size - frame_size + 1, hop)
            frame_rms = np.asarray(
                [np.sqrt(np.mean(np.square(waveform[start : start + frame_size]))) for start in starts]
            )
            noise_floor = float(np.percentile(frame_rms, 10))
            signal_level = float(np.percentile(frame_rms, 90))
            snr_proxy = 20.0 * np.log10((signal_level + 1e-8) / (noise_floor + 1e-8))
            active_ratio = float(np.mean(frame_rms >= max(0.01, noise_floor * 2.5)))
        else:
            snr_proxy = 0.0
            active_ratio = 1.0

        warnings: list[str] = []
        if duration < 0.7:
            warnings.append("Clip is very short; use 2–8 seconds when possible.")
        if clipping_ratio > 0.01:
            warnings.append("Audio is clipped/distorted.")
        if rms < 0.004:
            warnings.append("Vocalization is very quiet.")
        if active_ratio < 0.08:
            warnings.append("Very little active sound was found.")
        if snr_proxy < 5.0:
            warnings.append("Background noise may be masking the vocalization.")

        score = 100.0
        score -= min(35.0, clipping_ratio * 1200.0)
        score -= max(0.0, 5.0 - snr_proxy) * 5.0
        if duration < 0.7:
            score -= 20.0
        if rms < 0.004:
            score -= 20.0
        return {
            "score": round(float(np.clip(score, 0.0, 100.0)), 1),
            "duration_seconds": round(duration, 2),
            "snr_proxy_db": round(float(snr_proxy), 1),
            "clipping_percent": round(clipping_ratio * 100.0, 2),
            "active_audio_percent": round(active_ratio * 100.0, 1),
            "warnings": warnings,
        }

    def _yamnet_detection(self, audio_path: str | Path) -> dict:
        if self.yamnet is None:
            raise YAMNetUnavailable(self.yamnet_error or "YAMNet is unavailable")

        waveform, sample_rate = load_wav(audio_path)
        minimum_samples = int(0.975 * sample_rate)
        if waveform.size < minimum_samples:
            waveform = np.pad(waveform, (0, minimum_samples - waveform.size))

        outputs = self.yamnet(waveform.astype(np.float32, copy=False))
        scores = _as_numpy(outputs[0]).astype(np.float64, copy=False)
        if scores.ndim != 2 or scores.shape[0] == 0:
            raise RuntimeError("YAMNet returned an invalid score matrix")
        assert self.class_names is not None
        if scores.shape[1] != len(self.class_names):
            raise RuntimeError(
                "YAMNet score columns do not match its class map "
                f"({scores.shape[1]} != {len(self.class_names)})"
            )

        dog_indices = self._label_indices(DOG_LABEL_WEIGHTS)
        cat_indices = self._label_indices(CAT_LABEL_WEIGHTS)
        dog_frames = self._group_frame_scores(scores, dog_indices)
        cat_frames = self._group_frame_scores(scores, cat_indices)
        dog_evidence = self._aggregate_frames(dog_frames)
        cat_evidence = self._aggregate_frames(cat_frames)

        excluded_names = (
            set(DOG_LABEL_WEIGHTS)
            | set(CAT_LABEL_WEIGHTS)
            | NON_COMPETING_PARENT_LABELS
        )
        other_indices = [
            index for index, name in enumerate(self.class_names) if name not in excluded_names
        ]
        other_frames = np.max(scores[:, other_indices], axis=1) if other_indices else np.zeros(scores.shape[0])
        other_evidence = self._aggregate_frames(other_frames)

        evidence = {"dog": dog_evidence, "cat": cat_evidence}
        species = max(evidence, key=evidence.get)
        best = evidence[species]
        second = evidence["cat" if species == "dog" else "dog"]
        separation = max(0.0, (best - second) / (best + second + 1e-8))
        strength = float(np.clip(best / 0.35, 0.0, 1.0))
        confidence = float(
            np.clip((0.50 + 0.48 * separation) * (0.72 + 0.28 * strength), 0.50, 0.98)
        )

        min_evidence = 0.10 if self.strict else 0.065
        min_separation = 0.18 if self.strict else 0.10
        unknown_reasons: list[str] = []
        if best < min_evidence:
            unknown_reasons.append("Cat/dog vocal evidence is too weak.")
        if separation < min_separation and second >= min_evidence * 0.55:
            unknown_reasons.append("Cat and dog evidence is ambiguous.")
        if other_evidence >= 0.65 and best < 0.16:
            unknown_reasons.append("Another sound is much stronger than the pet vocalization.")

        winning_indices = dog_indices if species == "dog" else cat_indices
        subtype_scores = {
            name: self._aggregate_frames(scores[:, index] * weight)
            for index, weight, name in winning_indices
        }
        subtype = max(subtype_scores, key=subtype_scores.get) if subtype_scores else species.title()

        return {
            "species": None if unknown_reasons else species,
            "candidate_species": species,
            "species_confidence": confidence,
            "pet_vocal_evidence": best,
            "dog_evidence": dog_evidence,
            "cat_evidence": cat_evidence,
            "other_audio_evidence": other_evidence,
            "separation": separation,
            "vocalization_type": subtype,
            "unknown_reasons": unknown_reasons,
            "top_audio_events": self._event_summary(scores),
            "audio_quality": self._audio_quality(waveform, sample_rate),
            "frame_count": int(scores.shape[0]),
        }

    def _legacy_species(self, vector: np.ndarray) -> tuple[str, float]:
        probabilities = self.legacy._species_probabilities(vector)
        classes = [str(value) for value in self.legacy.model["species_classes"].tolist()]
        index = int(np.argmax(probabilities))
        return classes[index], float(probabilities[index])

    @staticmethod
    def _acoustic_profile(features: dict[str, float], emotion: dict | None = None) -> dict:
        profile = {
            "duration_seconds": round(features["duration"], 2),
            "dominant_pitch_hz": round(features["pitch_mean"], 1),
            "tonality": "tonal" if features["tonality_mean"] >= 2.0 else "rough/noisy",
        }
        if emotion is None:
            profile.update({"arousal": "not estimated", "arousal_score": 0.0})
        else:
            profile.update(
                {
                    "arousal": emotion["arousal_level"],
                    "arousal_score": emotion["arousal_score"],
                }
            )
        return profile

    def _legacy_fallback(self, audio_path: str | Path) -> dict:
        result = self.legacy.predict(audio_path)
        result.update(
            {
                "engine": "PawSense legacy fallback",
                "precision_mode": "fallback",
                "pet_vocal_evidence": None,
                "model_consensus": "YAMNet unavailable",
                "vocalization_type": "Not available",
                "top_audio_events": [],
                "audio_quality": {"score": None, "warnings": []},
                "generalization_warning": (
                    "The AudioSet engine did not load, so this result uses the smaller "
                    "original dataset and may not generalize to outside recordings. "
                    f"Reason: {self.yamnet_error or 'unknown'}"
                ),
                "model_version": "2.0.0-fallback",
            }
        )
        return result

    def predict(self, audio_path: str | Path) -> dict:
        if self.yamnet is None:
            if self.allow_legacy_fallback:
                return self._legacy_fallback(audio_path)
            raise YAMNetUnavailable(self.yamnet_error or "YAMNet is unavailable")

        detection = self._yamnet_detection(audio_path)
        vector = extract_features(audio_path)
        features = feature_dict(vector)
        legacy_species, legacy_confidence = self._legacy_species(vector)

        selected_species = detection["species"]
        consensus = (
            "agree"
            if selected_species is not None and selected_species == legacy_species
            else "disagree"
            if selected_species is not None
            else "not applicable"
        )

        # A weak YAMNet result that conflicts with the original acoustic model
        # is rejected.  Strong AudioSet evidence is retained but flagged.
        if (
            selected_species is not None
            and legacy_species != selected_species
            and (
                detection["pet_vocal_evidence"] < 0.24
                or detection["species_confidence"] < 0.82
            )
        ):
            detection["unknown_reasons"].append(
                "The two independent species detectors disagree."
            )
            selected_species = None

        common = {
            "engine": "AudioSet YAMNet + PawSense acoustic verifier",
            "precision_mode": "strict" if self.strict else "balanced",
            "pet_vocal_evidence": round(float(detection["pet_vocal_evidence"]), 4),
            "dog_evidence": round(float(detection["dog_evidence"]), 4),
            "cat_evidence": round(float(detection["cat_evidence"]), 4),
            "other_audio_evidence": round(float(detection["other_audio_evidence"]), 4),
            "vocalization_type": detection["vocalization_type"],
            "top_audio_events": detection["top_audio_events"],
            "audio_quality": detection["audio_quality"],
            "analysed_windows": detection["frame_count"],
            "legacy_species_vote": legacy_species,
            "legacy_species_confidence": round(legacy_confidence, 4),
            "model_consensus": consensus,
            "safety_note": SAFETY_NOTE,
            "model_version": "2.0.0",
        }

        if selected_species is None:
            reasons = detection["unknown_reasons"] or [
                "There is not enough reliable evidence for a cat or dog vocalization."
            ]
            return {
                **common,
                "species": "unknown",
                "species_display": "Unknown / not enough evidence",
                "species_confidence": 0.0,
                "candidate_species": detection["candidate_species"],
                "estimated_state": "not_estimated",
                "estimated_state_display": "Not estimated",
                "confidence": 0.0,
                "uncertain": True,
                "unknown_reasons": reasons,
                "acoustic_profile": self._acoustic_profile(features),
                "guidance": (
                    "Could not confirm a cat or dog vocalization. Try a clear 2–8 second "
                    "clip containing the actual bark/meow, with less music, speech or noise."
                ),
            }

        species_confidence = float(detection["species_confidence"])
        if consensus == "agree":
            species_confidence = min(0.99, species_confidence + 0.025)

        emotion = self.legacy._emotion_prediction(vector, selected_species)
        state = emotion["state"]
        combined_confidence = float(
            np.clip(species_confidence * emotion["emotion_confidence"], 0.0, 0.95)
        )
        uncertain = bool(combined_confidence < 0.42 or consensus == "disagree")
        display = DISPLAY_LABELS[selected_species][state]
        if uncertain:
            display = f"Uncertain — closest acoustic match: {display}"

        return {
            **common,
            "species": selected_species,
            "species_display": "Cat" if selected_species == "cat" else "Dog",
            "species_confidence": round(species_confidence, 4),
            "candidate_species": selected_species,
            "estimated_state": state,
            "estimated_state_display": display,
            "confidence": round(combined_confidence, 4),
            "uncertain": uncertain,
            "unknown_reasons": [],
            "acoustic_profile": self._acoustic_profile(features, emotion),
            "guidance": GUIDANCE[state],
        }
