import api from "./api";

// ============================================================
// START EMERGENCY CONVERSATION
// ============================================================

export const startEmergency = async (petName, message) => {
  const response = await api.post(
    "/emergency/start",
    {
      pet_name: petName,
      message: message,
    }
  );

  return response.data;
};

// ============================================================
// CONTINUE EMERGENCY CONVERSATION
// ============================================================

export const continueEmergency = async (
  conversationId,
  message
) => {
  const response = await api.post(
    "/emergency/chat",
    {
      conversation_id: conversationId,
      message: message,
    }
  );

  return response.data;
};

// ============================================================
// GET LOGGED-IN USER'S PET
// ============================================================

export const getMyPet = async () => {
  const response = await api.get("/pets/me");
  return response.data;
};