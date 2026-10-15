from pydantic import BaseModel, Field
from typing import Optional


class BCSRequest(BaseModel):

    species: str

    age: float = Field(gt=0)

    gender: str

    weight: float = Field(gt=0)

    height: float = Field(gt=0)

    breed: Optional[str] = None


class BCSResponse(BaseModel):

    bcs_score: Optional[int] = None

    status: str

    weight: float

    height: float

    ideal_weight: Optional[float] = None

    weight_difference_percent: Optional[float] = None

    weight_source: str

    recommendation: list[str]

    diet_message: str