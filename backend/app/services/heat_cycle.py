from datetime import datetime, timedelta

from app.models.pet import PetModel
from app.models.heat_cycle import HeatCycleModel


DOG_CYCLE_DAYS = 180
CAT_CYCLE_DAYS = 21

REMINDER_DAYS_BEFORE = 7

WINDOW_DAYS_BEFORE = 3
WINDOW_DAYS_AFTER = 3


def calculate_next_cycle(
    species: str,
    last_heat_date: datetime
):

    species = species.lower()

    if species == "dog":
        cycle_days = DOG_CYCLE_DAYS

    elif species == "cat":
        cycle_days = CAT_CYCLE_DAYS

    else:
        raise ValueError(
            "Species must be either dog or cat."
        )

    return last_heat_date + timedelta(
        days=cycle_days
    )


def calculate_reminder_date(
    next_heat_date: datetime
):

    return next_heat_date - timedelta(
        days=REMINDER_DAYS_BEFORE
    )


def calculate_heat_window(
    next_heat_date: datetime
):

    window_start = next_heat_date - timedelta(
        days=WINDOW_DAYS_BEFORE
    )

    window_end = next_heat_date + timedelta(
        days=WINDOW_DAYS_AFTER
    )

    return window_start, window_end


async def save_heat_cycle(
    pet_id: str,
    user_id: str,
    last_heat_date: datetime
):

    # Get actual pet
    pet = await PetModel.get_pet_by_id(pet_id)

    if not pet:
        raise ValueError("Pet not found.")

    # Make sure the pet belongs to this user
    if str(pet["user_id"]) != str(user_id):
        raise ValueError(
            "You are not authorized to access this pet."
        )

    species = pet["species"].lower()

    # Only female pets can have heat cycles
    if pet["gender"].lower() != "female":
        raise ValueError(
            "Heat cycle tracking is available for female pets only."
        )

    next_heat_date = calculate_next_cycle(
        species,
        last_heat_date
    )

    reminder_date = calculate_reminder_date(
        next_heat_date
    )

    window_start, window_end = calculate_heat_window(
        next_heat_date
    )

    now = datetime.utcnow()

    heat_cycle_data = {

        "pet_id": pet["_id"],

        "user_id": pet["user_id"],

        "species": species,

        "last_heat_date": last_heat_date,

        "next_estimated_heat": next_heat_date,

        "reminder_date": reminder_date,

        "heat_window_start": window_start,

        "heat_window_end": window_end,

        "created_at": now,

        "updated_at": now
    }

    created_cycle = await HeatCycleModel.create_heat_cycle(
        heat_cycle_data
    )

    return created_cycle