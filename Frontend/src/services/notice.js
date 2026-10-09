import api from "../api/axios";

export const createNotice = async (data) => {

    const response = await api.post("/notices", data);

    return response.data;

};

export const getAllNotices = async () => {

    const response = await api.get("/notices");

    return response.data;

};

export const markNoticesRead = async (ids) => {

    const response = await api.post("/notices/read", { ids });

    return response.data;

};

export const deleteNotice = async (id) => {

    const response = await api.delete(`/notices/${id}`);

    return response.data;

};