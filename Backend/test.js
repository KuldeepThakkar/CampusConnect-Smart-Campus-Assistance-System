const timetableService = require("./src/services/timetable.service");

// Pick a real department/branch/semester/division from your updated timetable.json
const dept = "Technology", branch = "AI", sem = 2, div = "AI-B";

// Test ONGOING (pick a time inside a real lecture, e.g. 09:20 for your 09:00-9:50 example)
console.log(timetableService.getNextLecture(dept, branch, sem, div, new Date("2026-09-24T09:20:00")));

// Test BREAK (12:30, inside your 12:20-13:10 BREAK row)
console.log(timetableService.getNextLecture(dept, branch, sem, div, new Date("2026-09-24T14:30:00")));

// Test NO_LECTURE (11:45, inside your empty 11:30-12:20 row)
console.log(timetableService.getNextLecture(dept, branch, sem, div, new Date("2026-09-24T15:30:00")));

// Test UPCOMING (before day starts, e.g. 08:00 — should skip nothing, first row is real)
console.log(timetableService.getNextLecture(dept, branch, sem, div, new Date("2026-09-24T16:30:00")));