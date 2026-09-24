const fs = require("fs");
const path = require("path");
const { timeToMinutes } = require("../utils/time.util");

// Load timetable.json once when the server starts
const timetableData = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "../data/timetable.json"),
        "utf8"
    )
);

function getAcademicOptions() {
    const academicOptions = {};

    timetableData.forEach((record) => {

        const { department, branch, semester, division } = record;

        if (!academicOptions[department]) {
            academicOptions[department] = {};
        }

        if (!academicOptions[department][branch]) {
            academicOptions[department][branch] = {};
        }

        if (!academicOptions[department][branch][semester]) {
            academicOptions[department][branch][semester] = [];
        }

        if (
            !academicOptions[department][branch][semester].includes(division)
        ) {
            academicOptions[department][branch][semester].push(division);
        }

    });

    return academicOptions;
}

function getDivisionTimetable(department, branch, semester, division) {
    const divisionData = timetableData.find((record) => {
    return (
        record.department === department &&
        record.branch === branch &&
        record.semester === semester &&
        record.division === division
    );
});

return divisionData;
}

function getTodaySchedule(
    department,
    branch,
    semester,
    division,
    currentDate = new Date()
) {

    const divisionTimetable = getDivisionTimetable(
        department,
        branch,
        semester,
        division
    );

    if (!divisionTimetable) {
        return [];
    }

    const today = currentDate.toLocaleDateString("en-US", {
        weekday: "long"
    });

    return divisionTimetable.schedule[today] || [];
}

function convertTimeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function getNextLecture(
    department,
    branch,
    semester,
    division,
    currentDate = new Date()
) {

    const todaySchedule = getTodaySchedule(
        department,
        branch,
        semester,
        division,
        currentDate
    );

    const day = currentDate.toLocaleDateString("en-US", {
        weekday: "long"
    });

    const currentTime =
        currentDate.getHours() * 60 +
        currentDate.getMinutes();

    const currentTimeString = currentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });

    if (!todaySchedule || todaySchedule.length === 0) {
        return {
            status: "NO_SCHEDULE",
            day,
            currentTime: currentTimeString,
            lecture: null
        };
    }

    // Pass 1: is "now" inside ANY row — a real lecture, a break, or an
    // explicit empty (no-lecture) slot? Rows with classroom === "" still
    // occupy real time on the schedule, so they must be checked here to
    // correctly report BREAK/NO_LECTURE instead of falling through to the
    // wrong upcoming lecture.
    for (const row of todaySchedule) {

        const rowStart = convertTimeToMinutes(row.startTime);
        const rowEnd = convertTimeToMinutes(row.endTime);

        if (currentTime >= rowStart && currentTime <= rowEnd) {

            if (row.classroom) {

                return {
                    status: "ONGOING",
                    day,
                    currentTime: currentTimeString,
                    lecture: row
                };

            }

            if (row.subject === "BREAK") {

                return {
                    status: "BREAK",
                    day,
                    currentTime: currentTimeString,
                    lecture: null
                };

            }

            return {
                status: "NO_LECTURE",
                day,
                currentTime: currentTimeString,
                lecture: null
            };

        }

    }

    // Pass 2: "now" isn't inside any row — find the next REAL lecture,
    // explicitly skipping break/no-lecture rows so they're never reported
    // as the "next" class.
    for (const row of todaySchedule) {

        const rowStart = convertTimeToMinutes(row.startTime);

        if (rowStart > currentTime && row.classroom) {

            return {
                status: "UPCOMING",
                day,
                currentTime: currentTimeString,
                lecture: row
            };

        }

    }

    return {
        status: "NO_MORE_CLASSES",
        day,
        currentTime: currentTimeString,
        lecture: null
    };
}

function getBusyClassrooms(day, time) {

    const currentMinutes = typeof time === "number"
        ? time
        : timeToMinutes(time);

    const busy = new Set();

    timetableData.forEach((record) => {

        const daySchedule = record.schedule?.[day];

        if (!daySchedule || daySchedule.length === 0) {
            return;
        }

        daySchedule.forEach((lecture) => {

            const start = convertTimeToMinutes(lecture.startTime);
            const end = convertTimeToMinutes(lecture.endTime);

            if (currentMinutes >= start && currentMinutes < end) {
                if (lecture.classroom) {
                    busy.add(lecture.classroom);
                }
            }

        });

    });

    return Array.from(busy).sort();

}

function isClassroomBusyInRange(day, classroom, startTime, endTime) {

    const rangeStart = timeToMinutes(startTime);
    const rangeEnd = timeToMinutes(endTime);

    for (const record of timetableData) {

        const daySchedule = record.schedule?.[day];

        if (!daySchedule || daySchedule.length === 0) {
            continue;
        }

        for (const lecture of daySchedule) {

            if (lecture.classroom !== classroom) {
                continue;
            }

            const lectureStart = convertTimeToMinutes(lecture.startTime);
            const lectureEnd = convertTimeToMinutes(lecture.endTime);

            if (rangeStart < lectureEnd && lectureStart < rangeEnd) {
                return true;
            }

        }

    }

    return false;

}

function getRawTimetable() {
    return timetableData;
}

function getPeriodSlotsForDay(day) {

    const slotMap = new Map();

    timetableData.forEach((record) => {

        const daySchedule = record.schedule?.[day];

        if (!daySchedule || daySchedule.length === 0) {
            return;
        }

        daySchedule.forEach((lecture) => {

            const key = `${lecture.startTime}-${lecture.endTime}`;

            if (!slotMap.has(key)) {
                slotMap.set(key, { startTime: lecture.startTime, endTime: lecture.endTime });
            }

        });

    });

    return Array.from(slotMap.values()).sort(
        (a, b) => convertTimeToMinutes(a.startTime) - convertTimeToMinutes(b.startTime)
    );

}

module.exports = {
    getAcademicOptions,
    getDivisionTimetable,
    getTodaySchedule,
    getNextLecture,
    getBusyClassrooms,
    isClassroomBusyInRange,
    getPeriodSlotsForDay,
    getRawTimetable
};