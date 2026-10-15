from pydantic import BaseModel, Field


class EmergencyConversationState(BaseModel):
    pet_name: str

    category: str | None = None

    symptoms: list[str] = Field(default_factory=list)

    duration: str | None = None

    weight_bearing: str = "unknown"

    trauma: str = "unknown"

    severe_pain: str = "unknown"

    affected_area: str | None = None

    # ---------------------------------------------------------
    # POISONING INFORMATION
    # ---------------------------------------------------------

    substance: str | None = None

    amount: str | None = None

    # ---------------------------------------------------------
    # CONVERSATION HISTORY
    # ---------------------------------------------------------

    messages: list[dict] = Field(default_factory=list)