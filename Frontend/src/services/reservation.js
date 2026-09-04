import api from "../api/axios";

export const createReservation = async (data) => {

    const response = await api.post("/reservations", data);

    return response.data;

};

export const getMyReservations = async () => {

    const response = await api.get("/reservations/me");

    return response.data;

};