import api from "./api";

// Track heat cycle using the logged-in user's pet
export const trackHeatCycle = async (lastHeatDate) => {
  const response = await api.post(
    "/heat-cycle/track",
    {
      last_heat_date: lastHeatDate,
    }
  );

  return response.data;
};

// Get the latest saved heat cycle
export const getLatestHeatCycle = async () => {
  const response = await api.get("/heat-cycle/latest");

  return response.data;
};