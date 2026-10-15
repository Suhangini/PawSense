import os
import shutil
import subprocess
import tempfile

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.emotion_detection import predict_emotion


router = APIRouter(
    prefix="/api/emotion",
    tags=["Emotion Detection"]
)


# ---------------------------------------------------------
# Supported audio/video formats
# ---------------------------------------------------------
SUPPORTED_SUFFIXES = {
    ".wav",
    ".mp3",
    ".m4a",
    ".ogg",
    ".webm",
    ".aac",
    ".flac",
    ".mp4",
    ".mov",
    ".3gp",
    ".wma",
}


@router.post("/predict")
async def detect_emotion(
    file: UploadFile = File(...)
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No audio file provided."
        )

    temp_input = None
    temp_wav = None

    try:

        # -------------------------------------------------
        # Check file format
        # -------------------------------------------------
        extension = os.path.splitext(file.filename)[1].lower()

        if extension not in SUPPORTED_SUFFIXES:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported file format: {extension}. "
                    f"Supported formats: "
                    f"{', '.join(sorted(SUPPORTED_SUFFIXES))}"
                )
            )

        # -------------------------------------------------
        # Check FFmpeg
        # -------------------------------------------------
        ffmpeg_path = shutil.which("ffmpeg")

        if ffmpeg_path is None:
            raise HTTPException(
                status_code=500,
                detail=(
                    "FFmpeg is not available on the server. "
                    "Please install FFmpeg and add it to PATH."
                )
            )

        # -------------------------------------------------
        # Read uploaded file
        # -------------------------------------------------
        audio_data = await file.read()

        if not audio_data:
            raise HTTPException(
                status_code=400,
                detail="The uploaded audio file is empty."
            )

        # -------------------------------------------------
        # Save uploaded file temporarily
        # -------------------------------------------------
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension
        ) as input_file:

            input_file.write(audio_data)
            temp_input = input_file.name

        # -------------------------------------------------
        # Create temporary WAV path
        # -------------------------------------------------
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".wav"
        ) as wav_file:

            temp_wav = wav_file.name

        # -------------------------------------------------
        # Convert input → mono 16 kHz PCM WAV
        # -------------------------------------------------
        result = subprocess.run(
            [
                ffmpeg_path,
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                temp_input,
                "-vn",
                "-ac",
                "1",
                "-ar",
                "16000",
                "-c:a",
                "pcm_s16le",
                temp_wav,
            ],
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )

        # -------------------------------------------------
        # Check conversion result
        # -------------------------------------------------
        if result.returncode != 0:

            detail = (
                result.stderr.strip().splitlines()[-1]
                if result.stderr.strip()
                else "Unknown FFmpeg error."
            )

            raise HTTPException(
                status_code=400,
                detail=f"Audio conversion failed: {detail}"
            )

        # -------------------------------------------------
        # Send normalized WAV to PawSense AI
        # -------------------------------------------------
        prediction = predict_emotion(temp_wav)

        return {
            "success": True,
            "filename": file.filename,
            "result": prediction
        }

    except HTTPException:
        raise

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=400,
            detail="Audio conversion timed out."
        )

    except Exception as e:

        print("Emotion detection error:", e)

        raise HTTPException(
            status_code=500,
            detail=f"Emotion detection failed: {str(e)}"
        )

    finally:

        # -------------------------------------------------
        # Cleanup temporary files
        # -------------------------------------------------
        for temp_file in [temp_input, temp_wav]:

            if temp_file and os.path.exists(temp_file):

                try:
                    os.remove(temp_file)

                except PermissionError:
                    print(
                        f"Could not remove temporary file: {temp_file}"
                    )