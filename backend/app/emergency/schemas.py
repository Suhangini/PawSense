from pydantic import BaseModel
from typing import Literal


class EmergencyRequest(BaseModel):
    pet_name: str
    message: str


class EmergencyResponse(BaseModel):
    pet_name: str
    category: str
    severity: str
    severity_reason: str
    message: str
    vet_required: bool


class GeminiEmergencyClassification(BaseModel):
    category: Literal[
        "bleeding",
        "breathing_problem",
        "poisoning",
        "allergic_reaction",
        "paw_injury",
        "limping_injury",
        "eye_issue",
        "heat_cycle",
        "unknown"
    ]

    symptoms: list[str]

    duration: str | None = None

    weight_bearing: Literal[
        "yes",
        "no",
        "unknown"
    ] = "unknown"

    trauma: Literal[
        "yes",
        "no",
        "unknown"
    ] = "unknown"

    severe_pain: Literal[
        "yes",
        "no",
        "unknown"
    ] = "unknown"

    affected_area: str | None = None

    urgency: Literal[
        "critical",
        "high",
        "medium",
        "low",
        "unknown"
    ]
    category: Literal[
        "bleeding",
        "breathing_problem",
        "poisoning",
        "allergic_reaction",
        "paw_injury",
        "limping_injury",
        "eye_issue",
        "heat_cycle",
        "unknown"
    ]

    symptoms: list[str]

    urgency: Literal[
        "critical",
        "high",
        "medium",
        "normal_or_concerning",
        "unknown"
    ]

class EmergencyStartRequest(BaseModel):
    pet_name: str
    message: str


class EmergencyChatRequest(BaseModel):
    conversation_id: str
    message: str


class EmergencyChatResponse(BaseModel):
    conversation_id: str
    pet_name: str
    status: Literal[
        "question",
        "complete"
    ]
    question: str | None = None
    category: str | None = None
    severity: str | None = None
    severity_reason: str | None = None
    message: str | None = None
    vet_required: bool = False