const timetableService = require("./timetable.service");
const classroomService = require("./classroom.service");
const campusData = require("./campus.service");
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

function getFreeClassrooms(day, time, buildingId) {

    const targetClassrooms = getClassroomsForBuilding(buildingId);
    const busySet = new Set(timetableService.getBusyClassrooms(day, time));

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

    return {
        day,
        time,
        buildings: Object.values(grouped)
    };

}

function getDaySchedule(day, buildingId) {

    const targetClassrooms = getClassroomsForBuilding(buildingId);
    const dayStartMinutes = timeToMinutes(CAMPUS_DAY_START);
    const dayEndMinutes = timeToMinutes(CAMPUS_DAY_END);
    const rawTimetable = timetableService.getRawTimetable();

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

        busyIntervals.sort((a, b) => a.start - b.start);

        // merge overlapping/adjacent busy blocks — defensive, in case two
        // divisions were ever accidentally double-booked into the same room
        const merged = [];

        busyIntervals.forEach((interval) => {

            const last = merged[merged.length - 1];

            if (last && interval.start <= last.end) {
                last.end = Math.max(last.end, interval.end);
            } else {
                merged.push({ ...interval });
            }

        });

        // walk the gaps between busy blocks to find free time
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

    return {
        day,
        dayStart: CAMPUS_DAY_START,
        dayEnd: CAMPUS_DAY_END,
        buildings: Object.values(grouped)
    };

}

module.exports = {
    getFreeClassrooms,
    getDaySchedule
};