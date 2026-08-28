const timetableService = require("./timetable.service");
const classroomService = require("./classroom.service");

function getFreeClassrooms(day, time) {

    const allClassrooms = classroomService.getAllClassrooms();
    const busyClassrooms = new Set(
        timetableService.getBusyClassrooms(day, time)
    );

    const free = allClassrooms.filter((room) => !busyClassrooms.has(room));

    return {
        day,
        time: typeof time === "number"
            ? // optional: you can leave time as passed-in string only
              time
            : time,
        total: allClassrooms.length,
        busyCount: busyClassrooms.size,
        freeCount: free.length,
        freeClassrooms: free,
        busyClassrooms: Array.from(busyClassrooms).sort()
    };

}

module.exports = {
    getFreeClassrooms
};