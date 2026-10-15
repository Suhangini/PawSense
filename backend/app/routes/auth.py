from fastapi import APIRouter, Depends 

from app.schemas.user_schema import UserSignup, UserLogin
from app.services.auth_service import AuthService

from app.dependencies import get_current_user

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/signup")
async def signup(user: UserSignup):
    return await AuthService.signup(user)


@router.post("/login")
async def login(user: UserLogin):
    return await AuthService.login(user)

@router.get("/me")
async def get_current_user_details(
    current_user=Depends(get_current_user)
):
    return {
        "id": str(current_user["_id"]),
        "full_name": current_user["full_name"],
        "email": current_user["email"]
        }