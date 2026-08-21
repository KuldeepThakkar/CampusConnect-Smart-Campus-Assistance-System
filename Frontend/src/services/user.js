import api from "../api/axios";

export const setAcademicDetails = async (data) => {

    const response = await api.post("/user/academic-details", data);

    return response.data;

};