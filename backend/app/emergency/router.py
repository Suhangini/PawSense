from fastapi import APIRouter
import uuid

from .conversation_store import (
    create_conversation,
    get_conversation,
    save_conversation
)

from .schemas import (
    EmergencyRequest,
    EmergencyResponse,
    EmergencyStartRequest,
    EmergencyChatRequest,
    EmergencyChatResponse
)

from .service import (
    detect_emergency,
    update_conversation_state,
    determine_severity,
    safe_classify_emergency
)

from .question_logic import get_next_question

from .knowledge_base import EMERGENCY_KNOWLEDGE_BASE


router = APIRouter(
    prefix="/api/emergency",
    tags=["Emergency First Aid"]
)


# ============================================================
# OLD SINGLE-MESSAGE ENDPOINT
# ============================================================

@router.post(
    "/analyze",
    response_model=EmergencyResponse
)
async def analyze_emergency(request: EmergencyRequest):

    category, data, symptoms, severity, severity_reason = await detect_emergency(
        request.message
    )

    if not data:

        return EmergencyResponse(
            pet_name=request.pet_name,
            category="unknown",
            severity="unknown",
            severity_reason=severity_reason,
            message=(
                "I couldn't confidently identify the emergency "
                "from the information provided.\n\n"
                "Please describe your pet's symptoms in more detail."
            ),
            vet_required=False
        )

    # Symptoms
    symptoms_text = "\n".join(
        f"- {symptom}"
        for symptom in symptoms
    )

    # Immediate actions
    actions_text = "\n".join(
        f"- {action}"
        for action in data["immediate_actions"]
    )

    # Things to avoid
    avoid_text = "\n".join(
        f"- {item}"
        for item in data["avoid"]
    )

    # Red flags
    red_flags_text = "\n".join(
        f"- {flag}"
        for flag in data["red_flags"]
    )

    response = (
        f"Possible concern: {data['name']}.\n\n"

        f"Symptoms identified:\n"
        f"{symptoms_text}\n\n"

        f"Immediate steps:\n"
        f"{actions_text}\n\n"

        f"Avoid:\n"
        f"{avoid_text}\n\n"

        f"Seek veterinary care immediately if:\n"
        f"{red_flags_text}\n\n"

        f"⚠️ This guidance is for first aid only and "
        f"does not replace examination by a veterinarian."
    )

    return EmergencyResponse(
        pet_name=request.pet_name,
        category=category,
        severity=severity,
        severity_reason=severity_reason,
        message=response,
        vet_required=data["vet_required"]
    )


# ============================================================
# START CONVERSATION
# ============================================================

@router.post(
    "/start",
    response_model=EmergencyChatResponse
)
async def start_emergency(request: EmergencyStartRequest):

    # Generate a unique conversation ID
    conversation_id = str(uuid.uuid4())

    # Create conversation state
    state = create_conversation(
        conversation_id,
        request.pet_name
    )

    # Store the first user message
    state.messages.append({
        "role": "user",
        "content": request.message
    })

    # Ask Gemini to understand the first message
    result = await safe_classify_emergency(
        request.message
    )

    # Update conversation state
    state = update_conversation_state(
    state,
    result,
    request.message
)

    # Save conversation
    save_conversation(
        conversation_id,
        state
    )

    # If Gemini cannot identify the problem
    if not state.category:

        return EmergencyChatResponse(
            conversation_id=conversation_id,
            pet_name=request.pet_name,
            status="question",
            question=(
                "Can you describe what is happening "
                "with your pet?"
            )
        )

    # Find next missing information
    next_question = get_next_question(
        state.category,
        state
    )

    # If information is still missing
    if next_question:

        return EmergencyChatResponse(
            conversation_id=conversation_id,
            pet_name=request.pet_name,
            status="question",
            question=next_question,
            category=state.category
        )

    # Otherwise calculate severity
    severity, severity_reason = determine_severity(
    state.category,
    state.symptoms,
    request.message,
    state.duration,
    state.weight_bearing,
    state.trauma,
    state.severe_pain
)

    return EmergencyChatResponse(
        conversation_id=conversation_id,
        pet_name=request.pet_name,
        status="complete",
        category=state.category,
        severity=severity,
        severity_reason=severity_reason,
        message="Emergency assessment completed.",
        vet_required=severity in ["high", "critical"]
    )


# ============================================================
# CONTINUE CONVERSATION
# ============================================================

@router.post(
    "/chat",
    response_model=EmergencyChatResponse
)
async def emergency_chat(request: EmergencyChatRequest):

    # --------------------------------------------------------
    # 1. Get existing conversation
    # --------------------------------------------------------

    state = get_conversation(
        request.conversation_id
    )

    if not state:

        return EmergencyChatResponse(
            conversation_id=request.conversation_id,
            pet_name="Unknown",
            status="question",
            question=(
                "This conversation was not found. "
                "Please start a new emergency assessment."
            )
        )

    # --------------------------------------------------------
    # 2. Store user's new message
    # --------------------------------------------------------

    state.messages.append({
        "role": "user",
        "content": request.message
    })

    # --------------------------------------------------------
    # 3. Build conversation context
    # --------------------------------------------------------

    conversation_context = "\n".join(
        f"{message['role']}: {message['content']}"
        for message in state.messages
    )

    # --------------------------------------------------------
    # 4. Ask Gemini to understand the new message
    # --------------------------------------------------------

    result = await safe_classify_emergency(
        request.message,
        conversation_context
    )

    # --------------------------------------------------------
    # 5. Update conversation state
    # --------------------------------------------------------

    state = update_conversation_state(
        state,
        result,
        request.message
    )

    save_conversation(
        request.conversation_id,
        state
    )

    # --------------------------------------------------------
    # 6. Check if another question is required
    # --------------------------------------------------------

    next_question = get_next_question(
        state.category,
        state
    )

    if next_question:

        return EmergencyChatResponse(
            conversation_id=request.conversation_id,
            pet_name=state.pet_name,
            status="question",
            question=next_question,
            category=state.category
        )

    # --------------------------------------------------------
    # 7. All required information collected
    # --------------------------------------------------------

    all_messages = " ".join(
        message["content"]
        for message in state.messages
    )

    severity, severity_reason = determine_severity(
    state.category,
    state.symptoms,
    all_messages,
    state.duration,
    state.weight_bearing,
    state.trauma,
    state.severe_pain
)

    # --------------------------------------------------------
    # 8. Get controlled knowledge-base information
    # --------------------------------------------------------

    data = EMERGENCY_KNOWLEDGE_BASE.get(
        state.category
    )

    if not data:

        return EmergencyChatResponse(
            conversation_id=request.conversation_id,
            pet_name=state.pet_name,
            status="question",
            question=(
                "Could you describe the problem "
                "in a little more detail?"
            )
        )

    # --------------------------------------------------------
    # 9. Build first-aid instructions
    # --------------------------------------------------------

    actions = "\n".join(
        f"- {action}"
        for action in data["immediate_actions"]
    )

    avoid = "\n".join(
        f"- {item}"
        for item in data["avoid"]
    )

    red_flags = "\n".join(
        f"- {flag}"
        for flag in data["red_flags"]
    )

    # --------------------------------------------------------
    # 9. Build personalized urgency message
    # --------------------------------------------------------

    if severity == "critical":

        urgency_message = (
            "🚨 This may be a critical situation. "
            "Please contact a veterinarian or emergency veterinary "
            "service immediately. Do not delay care."
        )

    elif severity == "high":

        if (
            state.category == "limping_injury"
            and state.weight_bearing == "no"
        ):

            urgency_message = (
                f"⚠️ {state.pet_name} is not putting weight on the "
                "affected leg. Because of this, veterinary assessment "
                "is recommended promptly."
            )

        elif state.trauma == "yes":

            urgency_message = (
                f"⚠️ Because {state.pet_name} has experienced trauma, "
                "veterinary assessment is recommended promptly."
            )

        else:

            urgency_message = (
                f"⚠️ The symptoms described for {state.pet_name} "
                "warrant prompt veterinary assessment."
            )

    elif severity == "medium":

        urgency_message = (
            f"🟡 The symptoms appear moderate. Restrict activity and "
            f"monitor {state.pet_name} closely. If the problem persists "
            "or worsens, contact your veterinarian."
        )

    elif severity == "low":

        urgency_message = (
            f"🟢 The symptoms appear mild based on the information "
            f"provided. Keep {state.pet_name} rested and monitor closely. "
            "If the condition worsens or does not improve, "
            "contact your veterinarian."
        )

    else:

        urgency_message = (
            "Please monitor your pet closely and contact a veterinarian "
            "if the condition worsens or you are concerned."
        )


    # --------------------------------------------------------
    # Build final response
    # --------------------------------------------------------

    response_message = (
        f"Based on what you've told me, this appears to be "
        f"{data['name']}.\n\n"

        f"{urgency_message}\n\n"

        f"**What to do now:**\n"
        f"{actions}\n\n"

        f"**Avoid:**\n"
        f"{avoid}\n\n"

        f"**Other warning signs:**\n"
        f"{red_flags}\n\n"

        f"⚠️ This is first-aid guidance only and does not "
        f"replace examination by a veterinarian."
    )

    # --------------------------------------------------------
    # 10. Final response
    # --------------------------------------------------------

    return EmergencyChatResponse(
        conversation_id=request.conversation_id,
        pet_name=state.pet_name,
        status="complete",
        category=state.category,
        severity=severity,
        severity_reason=severity_reason,
        message=response_message,
        vet_required=severity in ["high", "critical"]
    )