import axios from "axios";

const api = axios.create({
 baseURL: "https://pawsense-jkws.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// ATTACH JWT TOKEN TO PROTECTED REQUESTS
// ============================================================

api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// BREED DETECTION
// ============================================================

export const predictBreed = async (imageFile) => {
  const formData = new FormData();

  formData.append("file", imageFile);

  const response = await api.post(
    "/breed/predict",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export default api;
