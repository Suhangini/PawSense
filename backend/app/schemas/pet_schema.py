from pydantic import BaseModel
from typing import Optional


class PetCreate(BaseModel):

    petName: str
    age: float
    gender: str
    species: str
    weight: float
    height: float
    breed: str

    image: Optional[str] = None