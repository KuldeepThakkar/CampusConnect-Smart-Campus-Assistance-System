import api from "../api/axios";

export const getNextClass = async (navigationData) => {
    const response = await api.post(
        "/navigation/next-class",
        navigationData
    );

    return response.data;
};

export const navigateToClassroom = async ({ latitude, longitude, classroom }) => {

    const response = await api.post("/navigation/", {
        latitude,
        longitude,
        classroom
    });

    return response.data;

};