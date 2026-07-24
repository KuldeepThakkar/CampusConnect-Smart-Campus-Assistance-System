const timetableService = require("./src/services/timetable.service");

const testDate = new Date("2026-07-27T18:00:00");
const result = timetableService.getNextLecture(
    "Engineering",
    "CE",
    5,
    "CE-X",
    testDate
);
console.log(result);