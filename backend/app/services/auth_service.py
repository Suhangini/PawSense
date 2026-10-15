from datetime import datetime

from fastapi import HTTPException, status

from app.models.user import UserModel
from app.schemas.user_schema import UserSignup, UserLogin
from app.utils.hash import hash_password, verify_password
from app.utils.jwt_handler import create_access_token


class AuthService:

    @staticmethod
    async def signup(user: UserSignup):

        # Check if passwords match
        if user.password != user.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match."
            )

        # Check if email already exists
        existing_user = await UserModel.get_user_by_email(user.email)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered."
            )

        # Hash password
        hashed_password = hash_password(user.password)

        # Create user document
        new_user = {
            "full_name": user.full_name,
            "email": user.email,
            "password": hashed_password,
            "created_at": datetime.utcnow()
        }

        # Save user
        created_user = await UserModel.create_user(new_user)

        # Generate JWT token
        access_token = create_access_token(
            {
                "user_id": str(created_user["_id"]),
                "email": created_user["email"]
            }
        )

        # Return response
        return {
            "message": "User registered successfully!",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(created_user["_id"]),
                "full_name": created_user["full_name"],
                "email": created_user["email"]
            }
        }


    @staticmethod
    async def login(user: UserLogin):

        # Find user by email
        existing_user = await UserModel.get_user_by_email(user.email)

        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        # Verify password
        if not verify_password(
            user.password,
            existing_user["password"]
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        # Generate JWT token
        access_token = create_access_token(
            {
                "user_id": str(existing_user["_id"]),
                "email": existing_user["email"]
            }
        )

        return {
            "message": "Login successful!",
            "access_token": access_token,
            "token_type": "bearer"
        }