import api from "../api/axios";

export const signup = async (data) => {

    const response = await api.post("/auth/signup", data);

    return response.data;

};