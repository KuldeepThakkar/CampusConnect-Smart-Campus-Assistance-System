import api from "../api/axios";

export const getNextLecture = async (data) => {

    const response = await api.post("/timetable/next-lecture", data);

    return response.data;

};

export const getTodayLectures = async (data) => {

    const response = await api.post("/timetable/today-lectures", data);

    return response.data;

};