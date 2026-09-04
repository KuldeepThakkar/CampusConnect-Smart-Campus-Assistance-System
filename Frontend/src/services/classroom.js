import api from "../api/axios";
import { getCampusData } from "./campus";

export const getFreeClassroomsNow = async ({ day, time, building }) => {

    const response = await api.get("/classrooms/free", {
        params: { day, time, building }
    });

    return response.data;

};

export const getDaySchedule = async ({ day, building }) => {

    const response = await api.get("/classrooms/schedule", {
        params: { day, building }
    });

    return response.data;

};

export const getClassroomSlots = async ({ day, building }) => {

    const response = await api.get("/classrooms/slots", {
        params: { day, building }
    });

    return response.data;

};

export const getBuildingsWithClassrooms = async () => {

    const response = await getCampusData();

    return response.data.buildings.filter((b) => b.classrooms && b.classrooms.length > 0);

};