import api from "./api";

// User Signup
export const signup = async (userData) => {
  const response = await api.post("/auth/signup", userData);

  // Store JWT Token
  localStorage.setItem("token", response.data.access_token);

  return response.data;
};

// User Login
export const login = async (userData) => {
  const response = await api.post("/auth/login", userData);

  // Store JWT Token
  localStorage.setItem("token", response.data.access_token);

  return response.data;
};

// Get Current Logged-in User
export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");

  const response = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
};