import api from "../api/axios";

export const navigateToClassroom = async ({ latitude, longitude, classroom }) => {

    const response = await api.post("/navigation/", {
        latitude,
        longitude,
        classroom
    });

    return response.data;

};