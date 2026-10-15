# ============================================================
# PAWSENSE - BREED DETECTION ROUTE
# ============================================================

from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
from io import BytesIO

from app.services.breed_detection import predict_breed


router = APIRouter(
    prefix="/api/breed",
    tags=["Breed Detection"]
)


# ============================================================
# BREED PREDICTION
# ============================================================

@router.post("/predict")
async def detect_breed(
    file: UploadFile = File(...)
):

    try:

        # Read uploaded image
        image_data = await file.read()

        # Open image
        image = Image.open(
            BytesIO(image_data)
        )

        # Predict breed
        result = predict_breed(
            image
        )

        return {
            "success": True,
            "filename": file.filename,
            "breed": result["breed"],
            "confidence": result["confidence"]
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Breed detection failed: {str(e)}"
        )