from .conversation_state import EmergencyConversationState


# Temporary in-memory storage
conversations: dict[str, EmergencyConversationState] = {}


def create_conversation(
    conversation_id: str,
    pet_name: str
):
    state = EmergencyConversationState(
        pet_name=pet_name
    )

    conversations[conversation_id] = state

    return state


def get_conversation(conversation_id: str):
    return conversations.get(conversation_id)


def save_conversation(
    conversation_id: str,
    state: EmergencyConversationState
):
    conversations[conversation_id] = state