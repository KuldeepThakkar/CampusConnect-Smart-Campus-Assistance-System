const timetableService = require("./timetable.service");
const classroomService = require("./classroom.service");
const campusData = require("./campus.service");
const reservationService = require("./reservation.service");
const { timeToMinutes, minutesToTime } = require("../utils/time.util");
const { CAMPUS_DAY_START, CAMPUS_DAY_END } = require("../config/campusHours");

function getBuildingForClassroom(classroom) {

    const building = campusData.buildings.find((b) => b.classrooms.includes(classroom));

    return building
        ? { id: building.id, name: building.name }
        : { id: null, name: "Unknown" };

}

function getClassroomsForBuilding(buildingId) {

    if (!buildingId) {
        return classroomService.getAllClassrooms();
    }

    const building = campusData.buildings.find((b) => b.id === buildingId);

    return building ? building.classrooms : [];

}

function isRequestedDayToday(day) {
    const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return day === todayDayName;
}

async function getFreeClassrooms(day, time, buildingId) {

    const targetClassrooms = getClassroomsForBuilding(buildingId);
    const busySet = new Set(timetableService.getBusyClassrooms(day, time));

    if (isRequestedDayToday(day)) {

        const timeMinutes = typeof time === "number" ? time : timeToMinutes(time);
        const todaysReservations = await reservationService.getReservationsForToday();

        todaysReservations.forEach((reservation) => {

            const start = timeToMinutes(reservation.startTime);
            const end = timeToMinutes(reservation.endTime);

            if (timeMinutes >= start && timeMinutes < end) {
                busySet.add(reservation.classroom);
            }

        });

    }

    const grouped = {};

    targetClassrooms.forEach((room) => {

        const { id, name } = getBuildingForClassroom(room);

        if (!grouped[id]) {
            grouped[id] = { buildingId: id, buildingName: name, freeClassrooms: [], busyClassrooms: [] };
        }

        if (busySet.has(room)) {
            grouped[id].busyClassrooms.push(room);
        } else {
            grouped[id].freeClassrooms.push(room);
        }

    });

    const buildings = Object.values(grouped).filter(
        (b) => b.freeClassrooms.length > 0 || b.busyClassrooms.length > 0
    );

    return {
        day,
        time,
        buildings
    };

}

async function getDaySchedule(day, buildingId) {

    const targetClassrooms = getClassroomsForBuilding(buildingId);
    const dayStartMinutes = timeToMinutes(CAMPUS_DAY_START);
    const dayEndMinutes = timeToMinutes(CAMPUS_DAY_END);
    const rawTimetable = timetableService.getRawTimetable();

    const reservationsByRoom = {};

    if (isRequestedDayToday(day)) {

        const todaysReservations = await reservationService.getReservationsForToday();

        todaysReservations.forEach((reservation) => {

            if (!reservationsByRoom[reservation.classroom]) {
                reservationsByRoom[reservation.classroom] = [];
            }

            reservationsByRoom[reservation.classroom].push(reservation);

        });

    }

    const grouped = {};

    targetClassrooms.forEach((room) => {

        const busyIntervals = [];

        rawTimetable.forEach((record) => {

            const dayLectures = record.schedule?.[day] || [];

            dayLectures.forEach((lecture) => {

                if (lecture.classroom !== room) return;

                const start = Math.max(timeToMinutes(lecture.startTime), dayStartMinutes);
                const end = Math.min(timeToMinutes(lecture.endTime), dayEndMinutes);

                if (end > start) {
                    busyIntervals.push({ start, end, subject: lecture.subject, faculty: lecture.faculty });
                }

            });

        });

        (reservationsByRoom[room] || []).forEach((reservation) => {

            const start = Math.max(timeToMinutes(reservation.startTime), dayStartMinutes);
            const end = Math.min(timeToMinutes(reservation.endTime), dayEndMinutes);

            if (end > start) {
                busyIntervals.push({ start, end, subject: "Reserved", faculty: null });
            }

        });

        busyIntervals.sort((a, b) => a.start - b.start);

        const merged = [];

        busyIntervals.forEach((interval) => {

            const last = merged[merged.length - 1];

            const sameSubject = last && last.subject === interval.subject;

            if (last && sameSubject && interval.start <= last.end) {
                last.end = Math.max(last.end, interval.end);
            } else if (last && !sameSubject && interval.start < last.end) {
                merged.push({ ...interval, start: last.end });
            } else {
                merged.push({ ...interval });
            }

        });

        const freeBlocks = [];
        let cursor = dayStartMinutes;

        merged.forEach((interval) => {

            if (interval.start > cursor) {
                freeBlocks.push({ startTime: minutesToTime(cursor), endTime: minutesToTime(interval.start) });
            }

            cursor = Math.max(cursor, interval.end);

        });

        if (cursor < dayEndMinutes) {
            freeBlocks.push({ startTime: minutesToTime(cursor), endTime: minutesToTime(dayEndMinutes) });
        }

        const { id, name } = getBuildingForClassroom(room);

        if (!grouped[id]) {
            grouped[id] = { buildingId: id, buildingName: name, classrooms: [] };
        }

        grouped[id].classrooms.push({
            classroom: room,
            busy: merged.map((i) => ({
                startTime: minutesToTime(i.start),
                endTime: minutesToTime(i.end),
                subject: i.subject,
                faculty: i.faculty
            })),
            free: freeBlocks
        });

    });

    const buildings = Object.values(grouped).filter(
        (b) => b.classrooms.length > 0
    );

    return {
        day,
        dayStart: CAMPUS_DAY_START,
        dayEnd: CAMPUS_DAY_END,
        buildings
    };

}

async function getSlotAvailability(day, buildingId) {

    const targetClassrooms = getClassroomsForBuilding(buildingId);
    const periodSlots = timetableService.getPeriodSlotsForDay(day);

    let todaysReservations = [];

    if (isRequestedDayToday(day)) {
        todaysReservations = await reservationService.getReservationsForToday();
    }

    const grouped = {};

    targetClassrooms.forEach((room) => {

        const { id, name } = getBuildingForClassroom(room);

        if (!grouped[id]) {
            grouped[id] = { buildingId: id, buildingName: name, classrooms: [] };
        }

        const slots = periodSlots.map((period) => {

            const periodStart = timeToMinutes(period.startTime);
            const periodEnd = timeToMinutes(period.endTime);

            const timetableClash = timetableService.isClassroomBusyInRange(
                day,
                room,
                period.startTime,
                period.endTime
            );

            const reservationClash = todaysReservations.some((reservation) => {

                if (reservation.classroom !== room) return false;

                const resStart = timeToMinutes(reservation.startTime);
                const resEnd = timeToMinutes(reservation.endTime);

                return periodStart < resEnd && resStart < periodEnd;

            });

            return {
                startTime: period.startTime,
                endTime: period.endTime,
                free: !timetableClash && !reservationClash
            };

        });

        grouped[id].classrooms.push({
            classroom: room,
            slots
        });

    });

    const buildings = Object.values(grouped).filter(
        (b) => b.classrooms.length > 0
    );

    return {
        day,
        buildings
    };

}

module.exports = {
    getFreeClassrooms,
    getDaySchedule,
    getSlotAvailability
};