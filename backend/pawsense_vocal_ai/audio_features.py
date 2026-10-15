"""Dependency-light acoustic feature extraction for pet vocalizations.

The extractor intentionally uses NumPy and SciPy only. This keeps inference
portable while still capturing energy, pitch, noisiness, rhythm, timbre and
spectral shape. The same function is used for training and inference.
"""

from __future__ import annotations

import math
import warnings
from pathlib import Path
from typing import Iterable

import numpy as np
from scipy import fftpack, signal
from scipy.io import wavfile


TARGET_SAMPLE_RATE = 16_000
MAX_AUDIO_SECONDS = 12.0
EPS = 1e-10


BASE_FEATURE_NAMES = [
    "duration",
    "rms_mean",
    "rms_std",
    "rms_p90",
    "peak_abs",
    "zcr_mean",
    "zcr_std",
    "centroid_mean",
    "centroid_std",
    "bandwidth_mean",
    "bandwidth_std",
    "rolloff85_mean",
    "rolloff85_std",
    "flatness_mean",
    "flatness_std",
    "entropy_mean",
    "entropy_std",
    "flux_mean",
    "flux_std",
    "pitch_mean",
    "pitch_std",
    "pitch_p10",
    "pitch_p90",
    "voiced_ratio",
    "tonality_mean",
    "tonality_std",
    "onset_rate",
]
MFCC_FEATURE_NAMES = [
    f"mfcc_{index}_{stat}"
    for index in range(1, 14)
    for stat in ("mean", "std")
]
FEATURE_NAMES = BASE_FEATURE_NAMES + MFCC_FEATURE_NAMES


class AudioFeatureError(ValueError):
    """Raised when an audio clip cannot produce reliable acoustic features."""


def _to_float32(audio: np.ndarray) -> np.ndarray:
    if np.issubdtype(audio.dtype, np.integer):
        info = np.iinfo(audio.dtype)
        scale = float(max(abs(info.min), info.max))
        return audio.astype(np.float32) / scale
    if np.issubdtype(audio.dtype, np.floating):
        return np.nan_to_num(audio.astype(np.float32), copy=False)
    raise AudioFeatureError(f"Unsupported WAV sample type: {audio.dtype}")


def _resample(audio: np.ndarray, source_rate: int) -> np.ndarray:
    if source_rate == TARGET_SAMPLE_RATE:
        return audio
    divisor = math.gcd(int(source_rate), TARGET_SAMPLE_RATE)
    up = TARGET_SAMPLE_RATE // divisor
    down = int(source_rate) // divisor
    return signal.resample_poly(audio, up, down).astype(np.float32)


def _trim_and_limit(audio: np.ndarray) -> np.ndarray:
    if audio.size < TARGET_SAMPLE_RATE // 10:
        raise AudioFeatureError("Audio is shorter than 0.1 seconds")

    frame = max(160, TARGET_SAMPLE_RATE // 100)
    squared = np.square(audio, dtype=np.float64)
    envelope = np.sqrt(
        np.convolve(squared, np.ones(frame, dtype=np.float64) / frame, mode="same")
    )
    peak_envelope = float(np.max(envelope))
    if peak_envelope < 1e-5:
        raise AudioFeatureError("Audio is silent or too quiet")

    active = np.flatnonzero(envelope >= max(peak_envelope * 0.035, 1e-5))
    if active.size:
        padding = TARGET_SAMPLE_RATE // 20
        start = max(0, int(active[0]) - padding)
        end = min(audio.size, int(active[-1]) + padding)
        audio = audio[start:end]

    maximum = int(MAX_AUDIO_SECONDS * TARGET_SAMPLE_RATE)
    if audio.size > maximum:
        window = int(2.0 * TARGET_SAMPLE_RATE)
        window_energy = np.convolve(
            np.square(audio, dtype=np.float64),
            np.ones(window, dtype=np.float64),
            mode="valid",
        )
        center = int(np.argmax(window_energy)) + window // 2
        start = max(0, min(audio.size - maximum, center - maximum // 2))
        audio = audio[start : start + maximum]

    if audio.size < TARGET_SAMPLE_RATE // 10:
        raise AudioFeatureError("No meaningful vocalization remained after silence removal")
    return audio.astype(np.float32, copy=False)


def load_wav(path: str | Path) -> tuple[np.ndarray, int]:
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            sample_rate, raw = wavfile.read(str(path))
    except Exception as exc:  # scipy exposes several decoder-specific exceptions
        raise AudioFeatureError(f"Could not decode WAV audio: {exc}") from exc

    audio = _to_float32(np.asarray(raw))
    if audio.ndim == 2:
        audio = np.mean(audio, axis=1, dtype=np.float32)
    elif audio.ndim != 1:
        raise AudioFeatureError("Only mono or stereo WAV audio is supported")

    audio = _resample(audio, int(sample_rate))
    audio = _trim_and_limit(audio)
    return audio, TARGET_SAMPLE_RATE


def _mel_filterbank(
    sample_rate: int,
    n_fft: int,
    bands: int = 32,
    minimum_hz: float = 50.0,
    maximum_hz: float | None = None,
) -> np.ndarray:
    maximum_hz = maximum_hz or sample_rate / 2

    def hz_to_mel(value: float | np.ndarray) -> float | np.ndarray:
        return 2595.0 * np.log10(1.0 + np.asarray(value) / 700.0)

    def mel_to_hz(value: float | np.ndarray) -> float | np.ndarray:
        return 700.0 * (np.power(10.0, np.asarray(value) / 2595.0) - 1.0)

    mel_points = np.linspace(hz_to_mel(minimum_hz), hz_to_mel(maximum_hz), bands + 2)
    hz_points = mel_to_hz(mel_points)
    bins = np.floor((n_fft + 1) * hz_points / sample_rate).astype(int)
    bins = np.clip(bins, 0, n_fft // 2)

    bank = np.zeros((bands, n_fft // 2 + 1), dtype=np.float64)
    for band in range(1, bands + 1):
        left, center, right = bins[band - 1], bins[band], bins[band + 1]
        if center <= left:
            center = min(left + 1, n_fft // 2)
        if right <= center:
            right = min(center + 1, n_fft // 2 + 1)
        if center > left:
            bank[band - 1, left:center] = (
                np.arange(left, center) - left
            ) / float(center - left)
        if right > center:
            bank[band - 1, center:right] = (
                right - np.arange(center, right)
            ) / float(right - center)
    return bank


def _mean_std(values: np.ndarray) -> tuple[float, float]:
    finite = np.asarray(values, dtype=np.float64)
    finite = finite[np.isfinite(finite)]
    if finite.size == 0:
        return 0.0, 0.0
    return float(np.mean(finite)), float(np.std(finite))


def extract_features(path: str | Path) -> np.ndarray:
    audio, sample_rate = load_wav(path)
    duration = audio.size / sample_rate
    n_fft = 512
    hop = 256

    frequencies, _, spectrum = signal.stft(
        audio,
        fs=sample_rate,
        window="hann",
        nperseg=n_fft,
        noverlap=n_fft - hop,
        boundary=None,
        padded=False,
    )
    magnitude = np.abs(spectrum).astype(np.float64) + EPS
    power = np.square(magnitude)
    frames = magnitude.shape[1]
    if frames < 2:
        raise AudioFeatureError("Audio is too short for spectral analysis")

    frame_rms = np.sqrt(np.mean(power, axis=0))
    rms_mean, rms_std = _mean_std(frame_rms)
    rms_p90 = float(np.percentile(frame_rms, 90))

    signs = np.signbit(audio)
    crossings = np.flatnonzero(signs[1:] != signs[:-1])
    zcr_counts = np.histogram(
        crossings,
        bins=np.arange(0, max(audio.size, n_fft) + hop, hop),
    )[0]
    zcr = zcr_counts.astype(np.float64) / hop
    zcr_mean, zcr_std = _mean_std(zcr)

    magnitude_sum = np.sum(magnitude, axis=0) + EPS
    centroid = np.sum(frequencies[:, None] * magnitude, axis=0) / magnitude_sum
    bandwidth = np.sqrt(
        np.sum(np.square(frequencies[:, None] - centroid) * magnitude, axis=0)
        / magnitude_sum
    )
    cumulative = np.cumsum(power, axis=0)
    targets = cumulative[-1] * 0.85
    rolloff_indices = np.argmax(cumulative >= targets[None, :], axis=0)
    rolloff = frequencies[rolloff_indices]

    flatness = np.exp(np.mean(np.log(magnitude), axis=0)) / (
        np.mean(magnitude, axis=0) + EPS
    )
    normalized_power = power / (np.sum(power, axis=0, keepdims=True) + EPS)
    entropy = -np.sum(normalized_power * np.log(normalized_power + EPS), axis=0)
    entropy /= np.log(normalized_power.shape[0])

    column_norm = magnitude / (np.linalg.norm(magnitude, axis=0, keepdims=True) + EPS)
    flux = np.sqrt(np.sum(np.square(np.diff(column_norm, axis=1)), axis=0))

    pitch_mask = (frequencies >= 60.0) & (frequencies <= 1_500.0)
    pitch_magnitude = magnitude[pitch_mask]
    pitch_frequencies = frequencies[pitch_mask]
    pitch_indices = np.argmax(pitch_magnitude, axis=0)
    peak_frequency = pitch_frequencies[pitch_indices]
    peak_strength = np.max(pitch_magnitude, axis=0) / (
        np.mean(pitch_magnitude, axis=0) + EPS
    )
    active_threshold = max(float(np.percentile(frame_rms, 25)), rms_mean * 0.25)
    voiced = (peak_strength >= 5.0) & (frame_rms >= active_threshold)
    voiced_pitch = peak_frequency[voiced]
    if voiced_pitch.size:
        pitch_mean, pitch_std = _mean_std(voiced_pitch)
        pitch_p10, pitch_p90 = np.percentile(voiced_pitch, [10, 90]).tolist()
    else:
        pitch_mean = pitch_std = pitch_p10 = pitch_p90 = 0.0
    voiced_ratio = float(np.mean(voiced))
    tonality_mean, tonality_std = _mean_std(np.log1p(peak_strength))

    smooth_rms = signal.savgol_filter(
        frame_rms,
        min(11, frames if frames % 2 == 1 else frames - 1),
        2,
        mode="interp",
    ) if frames >= 5 else frame_rms
    prominence = max(float(np.std(smooth_rms)) * 0.5, EPS)
    peaks, _ = signal.find_peaks(smooth_rms, prominence=prominence, distance=2)
    onset_rate = float(peaks.size / max(duration, 0.1))

    mel_bank = _mel_filterbank(sample_rate, n_fft)
    mel_energy = mel_bank @ power
    log_mel = np.log(mel_energy + EPS)
    mfcc = fftpack.dct(log_mel, type=2, axis=0, norm="ortho")[:13]

    centroid_mean, centroid_std = _mean_std(centroid)
    bandwidth_mean, bandwidth_std = _mean_std(bandwidth)
    rolloff_mean, rolloff_std = _mean_std(rolloff)
    flatness_mean, flatness_std = _mean_std(flatness)
    entropy_mean, entropy_std = _mean_std(entropy)
    flux_mean, flux_std = _mean_std(flux)

    values: list[float] = [
        float(duration),
        rms_mean,
        rms_std,
        rms_p90,
        float(np.max(np.abs(audio))),
        zcr_mean,
        zcr_std,
        centroid_mean,
        centroid_std,
        bandwidth_mean,
        bandwidth_std,
        rolloff_mean,
        rolloff_std,
        flatness_mean,
        flatness_std,
        entropy_mean,
        entropy_std,
        flux_mean,
        flux_std,
        pitch_mean,
        pitch_std,
        float(pitch_p10),
        float(pitch_p90),
        voiced_ratio,
        tonality_mean,
        tonality_std,
        onset_rate,
    ]
    for coefficient in mfcc:
        coefficient_mean, coefficient_std = _mean_std(coefficient)
        values.extend([coefficient_mean, coefficient_std])

    features = np.nan_to_num(np.asarray(values, dtype=np.float64))
    if features.size != len(FEATURE_NAMES):
        raise RuntimeError(
            f"Feature schema mismatch: {features.size} values for {len(FEATURE_NAMES)} names"
        )
    return features


def feature_dict(features: Iterable[float]) -> dict[str, float]:
    vector = list(features)
    if len(vector) != len(FEATURE_NAMES):
        raise ValueError("Feature vector does not match the PawSense feature schema")
    return {name: float(value) for name, value in zip(FEATURE_NAMES, vector)}
