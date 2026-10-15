from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.schemas.pet_schema import PetCreate
from app.services.pet_service import PetService
from app.dependencies import get_current_user


# =========================
# REQUEST MODELS
# =========================

class PetImageUpdate(BaseModel):
    image: str


class PetHealthUpdate(BaseModel):
    age: float = Field(gt=0)
    height: float = Field(gt=0)
    weight: float = Field(gt=0)

    vaccination_status: str
    vaccination_date: str | None = None
    vaccination_notes: str | None = ""


# =========================
# ROUTER
# =========================

router = APIRouter(
    prefix="/api/pets",
    tags=["Pets"]
)


# =========================
# CREATE PET
# =========================

@router.post("/")
async def create_pet(
    pet: PetCreate,
    current_user=Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    pet_data = pet.model_dump()

    created_pet = await PetService.create_pet(
        pet_data,
        user_id
    )

    return {
        "message": "Pet profile created successfully.",
        "pet": {
            "id": str(created_pet["_id"]),
            "user_id": str(created_pet["user_id"]),
            "petName": created_pet["petName"],
            "age": created_pet["age"],
            "gender": created_pet["gender"],
            "species": created_pet["species"],
            "weight": created_pet["weight"],
            "height": created_pet["height"],
            "breed": created_pet["breed"],
            "image": created_pet.get("image")
        }
    }


# =========================
# GET CURRENT USER'S PET
# =========================

@router.get("/me")
async def get_my_pet(
    current_user=Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    pet = await PetService.get_my_pet(user_id)

    if not pet:
        raise HTTPException(
            status_code=404,
            detail="Pet profile not found."
        )

    return {
        "id": str(pet["_id"]),
        "user_id": str(pet["user_id"]),
        "petName": pet["petName"],
        "age": pet["age"],
        "gender": pet["gender"],
        "species": pet["species"],
        "weight": pet["weight"],
        "height": pet["height"],
        "breed": pet["breed"],
        "image": pet.get("image"),

        # Health Records
        "vaccination_status": pet.get(
            "vaccination_status",
            "Not Vaccinated"
        ),
        "vaccination_date": pet.get(
            "vaccination_date"
        ),
        "vaccination_notes": pet.get(
            "vaccination_notes",
            ""
        )
    }


# =========================
# UPDATE PET HEALTH RECORDS
# =========================

@router.put("/me")
async def update_my_pet_health(
    data: PetHealthUpdate,
    current_user=Depends(get_current_user)
):
    try:
        user_id = str(current_user["_id"])

        await PetService.update_pet_health(
            user_id,
            data.model_dump()
        )

        return {
            "success": True,
            "message": "Pet health information updated successfully."
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


# =========================
# UPDATE PET IMAGE
# =========================

@router.put("/image")
async def update_pet_image(
    data: PetImageUpdate,
    current_user=Depends(get_current_user)
):
    try:
        await PetService.update_pet_image(
            current_user["_id"],
            data.image
        )

        return {
            "success": True,
            "message": "Pet image updated successfully"
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )