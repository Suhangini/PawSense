import api from "./api";

export const detectFood = async (imageFile) => {
  const formData = new FormData();

  formData.append("file", imageFile);

  const response = await api.post(
    "/food/predict",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};