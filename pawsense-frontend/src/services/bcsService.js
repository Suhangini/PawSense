import api from "./api";

export const calculateBCS = async (pet) => {
    const response = await api.post("/bcs/calculate", {
        species: pet.species,
        age: Number(pet.age),
        gender: pet.gender,
        weight: Number(pet.weight),
        height: Number(pet.height),
        breed: pet.breed || null
    });

    return response.data;
};