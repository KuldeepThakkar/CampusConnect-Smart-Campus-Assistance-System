import api from "../api/axios";

export const getNextClass = async (navigationData) => {
    const response = await api.post(
        "/navigation/next-class",
        navigationData
    );

    return response.data;
};