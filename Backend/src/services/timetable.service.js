const fs = require("fs");
const path = require("path");

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

        // Create department if it doesn't exist
        if (!academicOptions[department]) {
            academicOptions[department] = {};
        }

        // Create branch if it doesn't exist
        if (!academicOptions[department][branch]) {
            academicOptions[department][branch] = {};
        }

        // Create semester if it doesn't exist
        if (!academicOptions[department][branch][semester]) {
            academicOptions[department][branch][semester] = [];
        }

        // Add division if not already present
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

    for (const lecture of todaySchedule) {

        const lectureStartTime = convertTimeToMinutes(
            lecture.startTime
        );

        const lectureEndTime = convertTimeToMinutes(
            lecture.endTime
        );

        // Current lecture is running
        if (
            currentTime >= lectureStartTime &&
            currentTime <= lectureEndTime
        ) {
            return {
                status: "ONGOING",
                day,
                currentTime: currentTimeString,
                lecture
            };
        }

        // Next upcoming lecture
        if (lectureStartTime > currentTime) {
            return {
                status: "UPCOMING",
                day,
                currentTime: currentTimeString,
                lecture
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

module.exports = {
    getAcademicOptions,
    getDivisionTimetable,
    getTodaySchedule,
    getNextLecture
};