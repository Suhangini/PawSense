from fastapi import APIRouter
from app.schemas.bcs_schema import BCSRequest, BCSResponse
from app.services.bcs_service import calculate_bcs


router = APIRouter(
    prefix="/api/bcs",
    tags=["BCS"]
)


@router.post("/calculate", response_model=BCSResponse)
async def calculate_bcs_endpoint(data: BCSRequest):

    result = calculate_bcs(data)

    return result