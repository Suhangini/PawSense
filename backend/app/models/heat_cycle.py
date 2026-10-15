from datetime import datetime
from app.database import heat_cycle_collection
from bson.objectid import ObjectId


class HeatCycleModel:

    @staticmethod
    async def create_heat_cycle(data: dict):

        result = await heat_cycle_collection.insert_one(data)

        return await heat_cycle_collection.find_one(
            {"_id": result.inserted_id}
        )


    @staticmethod
    async def get_latest_by_pet_id(pet_id: str):

        return await heat_cycle_collection.find_one(
            {"pet_id": ObjectId(pet_id)},
            sort=[("created_at", -1)]
        )


    @staticmethod
    async def get_history_by_pet_id(pet_id: str):

        cursor = heat_cycle_collection.find(
            {"pet_id": ObjectId(pet_id)}
        ).sort(
            "created_at",
            -1
        )

        return await cursor.to_list(length=100)


    @staticmethod
    async def update_latest_heat_cycle(
        pet_id: str,
        data: dict
    ):

        result = await heat_cycle_collection.update_one(
            {
                "pet_id": ObjectId(pet_id)
            },
            {
                "$set": data
            }
        )

        return result.modified_count > 0