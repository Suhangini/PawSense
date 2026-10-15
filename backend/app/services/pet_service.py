from bson.objectid import ObjectId

from app.models.pet import PetModel


class PetService:

    @staticmethod
    async def create_pet(pet_data: dict, user_id: str):

        pet_data["user_id"] = ObjectId(user_id)

        return await PetModel.create_pet(pet_data)


    @staticmethod
    async def get_my_pet(user_id: str):

        return await PetModel.get_pet_by_user_id(user_id)
    
    @staticmethod
    async def update_pet_image(user_id, image):
        updated = await PetModel.update_pet_image(user_id, image)

        if not updated:
            raise ValueError("Pet not found")

        return True
    
    @staticmethod
    async def update_pet_health(user_id, health_data: dict):

        updated = await PetModel.update_pet_health(
            user_id,
            health_data
        )

        if not updated:
            raise ValueError("Pet not found")

        return True