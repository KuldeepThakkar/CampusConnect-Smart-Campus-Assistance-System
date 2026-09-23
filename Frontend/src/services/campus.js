import api from "../api/axios";

export const getCampusData = async () => {

    const response = await api.get("/campus");

    return response.data;

};