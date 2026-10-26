from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import database
from app.routes.auth import router as auth_router
from app.routes.breed import router as breed_router
from app.routes.pet import router as pet_router
from app.routes.food import router as food_router
from app.routes.heat_cycle import router as heat_cycle_router
from app.routes.emotion import router as emotion_router
from app.emergency.router import router as emergency_router
from app.routes import bcs

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "https://pawsense-frontend.onrender.com",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(breed_router)
app.include_router(pet_router)
app.include_router(food_router)
app.include_router(heat_cycle_router)
app.include_router(emotion_router)
app.include_router(emergency_router)
app.include_router(bcs.router)


@app.get("/")
async def root():
    return {"message": "PawSense Backend Running Successfully 🐾"}


@app.get("/db-test")
async def db_test():
    try:
        await database.command("ping")
        return {
            "status": "success",
            "message": "MongoDB Connected Successfully ✅"
        }
    except Exception as e:
        return {
            "status": "failed",
            "error": str(e)
        }
