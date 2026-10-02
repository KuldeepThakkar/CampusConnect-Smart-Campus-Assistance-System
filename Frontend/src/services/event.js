import api from "../api/axios";

export const createEvent = async (data) => {

    const response = await api.post("/events", data);

    return response.data;

};

export const getAllEvents = async () => {

    const response = await api.get("/events");

    return response.data;

};