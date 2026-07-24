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

module.exports = {
    getAcademicOptions
};