from app.database import user_collection
from bson.objectid import ObjectId


class UserModel:

    @staticmethod
    async def get_user_by_email(email: str):
        """
        Find a user by email.
        """
        return await user_collection.find_one({"email": email})


    @staticmethod
    async def get_user_by_id(user_id: str):
        """
        Find a user by MongoDB ObjectId.
        """
        return await user_collection.find_one(
            {"_id": ObjectId(user_id)}
        )


    @staticmethod
    async def create_user(user_data: dict):
        """
        Insert a new user.
        """
        result = await user_collection.insert_one(user_data)

        return await user_collection.find_one(
            {"_id": result.inserted_id}
        )