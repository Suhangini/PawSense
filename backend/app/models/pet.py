from unittest import result
from app.database import pet_collection
from bson.objectid import ObjectId


class PetModel:

    @staticmethod
    async def create_pet(pet_data: dict):
        """
        Create a new pet.
        """

        result = await pet_collection.insert_one(pet_data)

        return await pet_collection.find_one(
            {"_id": result.inserted_id}
        )


    @staticmethod
    async def get_pet_by_user_id(user_id: str):
        """
        Find the pet belonging to a user.
        """

        return await pet_collection.find_one(
            {"user_id": ObjectId(user_id)}
        )


    @staticmethod
    async def get_pet_by_id(pet_id: str):
        """
        Find a pet by its MongoDB ObjectId.
        """

        return await pet_collection.find_one(
            {"_id": ObjectId(pet_id)}
        )
    
    @staticmethod
    async def update_pet_image(user_id, image):
        result = await pet_collection.update_one(
        {"user_id": user_id},
        {"$set": {"image": image}}
    )

        return result.modified_count > 0
    
    @staticmethod
    async def update_pet_health(user_id, health_data: dict):
        result = await pet_collection.update_one(
            {"user_id": ObjectId(user_id)},
            {
                "$set": {
                    "age": health_data["age"],
                    "height": health_data["height"],
                    "weight": health_data["weight"],
                    "vaccination_status": health_data["vaccination_status"],
                    "vaccination_date": health_data.get("vaccination_date"),
                    "vaccination_notes": health_data.get("vaccination_notes", "")
                }
            }
        )

        return result.modified_count > 0