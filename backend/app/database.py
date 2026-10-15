from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.MONGO_URL)

database = client[settings.DATABASE_NAME]

user_collection = database["users"]
pet_collection = database["pets"]
health_collection = database["health_records"]
heat_cycle_collection = database["heat_cycles"]