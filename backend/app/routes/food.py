from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
from io import BytesIO

from app.services.food_detection import predict_food


router = APIRouter(
    prefix="/api/food",
    tags=["Food & Toxicity Detection"]
)


@router.post("/predict")
async def detect_food(file: UploadFile = File(...)):

    try:
        # Read uploaded image
        image_data = await file.read()

        # Convert bytes to PIL image
        image = Image.open(
            BytesIO(image_data)
        ).convert("RGB")

        # Predict food and toxicity
        result = predict_food(image)

        return {
            "success": True,
            "filename": file.filename,
            "food": result["food"],
            "food_confidence": result["food_confidence"],
            "toxic_probability": result["toxic_probability"],
            "toxicity": result["toxicity"]
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Food detection failed: {str(e)}"
        )