from groq import Groq
import json

from app.config import settings
from .schemas import GeminiEmergencyClassification


client = Groq(
    api_key=settings.GROQ_API_KEY
)


async def classify_emergency(
    message: str,
    conversation_context: str = ""
) -> GeminiEmergencyClassification:

    prompt = f"""
You are PawSense, an AI pet-care assistant for dogs and cats.

Your task is ONLY to extract information from the user's latest message
and classify the emergency when possible.

Choose exactly ONE category from:

- bleeding
- breathing_problem
- poisoning
- allergic_reaction
- paw_injury
- limping_injury
- eye_issue
- heat_cycle
- unknown

Rules:

1. Do not diagnose diseases.
2. Do not invent symptoms.
3. Extract only information explicitly stated by the user.
4. Use the previous conversation context to understand short answers
   such as "yes", "no", "about one day", etc.
5. Preserve information already established in the conversation.
6. If the category cannot be determined, use "unknown".
7. Do not provide medical advice.
8. Return ONLY valid JSON.
9. The JSON must contain exactly these fields:

category
symptoms
duration
weight_bearing
trauma
severe_pain
affected_area
urgency

10. For fields where the information is not known, use:
- null for duration and affected_area
- "unknown" for weight_bearing, trauma, severe_pain and urgency
- [] for symptoms

Previous conversation context:
{conversation_context}

Latest user message:
{message}
"""

    response = await client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are PawSense. "
                    "Return only valid JSON. "
                    "Do not provide medical advice."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    response_text = response.choices[0].message.content

    data = json.loads(response_text)

    return GeminiEmergencyClassification.model_validate(data)