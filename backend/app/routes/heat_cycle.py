from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies import get_current_user
from app.services.heat_cycle import save_heat_cycle
from app.models.heat_cycle import HeatCycleModel


router = APIRouter(
    prefix="/api/heat-cycle",
    tags=["Heat Cycle"]
)


class HeatCycleRequest(BaseModel):

    last_heat_date: datetime


@router.post("/track")
async def track_heat_cycle(
    data: HeatCycleRequest,
    current_user=Depends(get_current_user)
):

    try:

        user_id = str(current_user["_id"])

        # Get the user's pet
        from app.services.pet_service import PetService

        pet = await PetService.get_my_pet(user_id)

        if not pet:
            raise HTTPException(
                status_code=404,
                detail="Pet profile not found."
            )

        result = await save_heat_cycle(
            pet_id=str(pet["_id"]),
            user_id=user_id,
            last_heat_date=data.last_heat_date
        )

        return {
            "success": True,
            "message": "Heat cycle tracked successfully.",
            "data": {
                "pet_id": str(result["pet_id"]),
                "species": result["species"],
                "last_heat_date": result["last_heat_date"],
                "next_estimated_heat": result["next_estimated_heat"],
                "reminder_date": result["reminder_date"],
                "heat_window_start": result["heat_window_start"],
                "heat_window_end": result["heat_window_end"]
            }
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Heat cycle tracking failed: {str(e)}"
        )
    
@router.get("/latest")
async def get_latest_heat_cycle(
    current_user=Depends(get_current_user)
):

    try:

        user_id = str(current_user["_id"])

        # Get the user's pet
        from app.services.pet_service import PetService

        pet = await PetService.get_my_pet(user_id)

        if not pet:
            raise HTTPException(
                status_code=404,
                detail="Pet profile not found."
            )

        # Get latest heat cycle for this pet
        heat_cycle = await HeatCycleModel.get_latest_by_pet_id(
            str(pet["_id"])
        )

        if not heat_cycle:
            raise HTTPException(
                status_code=404,
                detail="No heat cycle record found."
            )

        return {
            "success": True,
            "data": {
                "pet_id": str(heat_cycle["pet_id"]),
                "species": heat_cycle["species"],
                "last_heat_date": heat_cycle["last_heat_date"],
                "next_estimated_heat": heat_cycle["next_estimated_heat"],
                "reminder_date": heat_cycle["reminder_date"],
                "heat_window_start": heat_cycle["heat_window_start"],
                "heat_window_end": heat_cycle["heat_window_end"]
            }
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch heat cycle: {str(e)}"
        )