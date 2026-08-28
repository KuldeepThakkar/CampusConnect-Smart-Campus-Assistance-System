// test-busy.js
const { getBusyClassrooms } = require("./src/services/timetable.service");

console.log("Monday 09:30:", getBusyClassrooms("Monday", "09:30"));
console.log("Monday 10:25:", getBusyClassrooms("Monday", "10:25"));
console.log("Saturday 09:30:", getBusyClassrooms("Saturday", "09:30")); // empty — no Saturday schedule