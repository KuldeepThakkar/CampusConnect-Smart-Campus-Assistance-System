const campusData = require("./campus.service");
const timetableService = require("./timetable.service");
const reportService = require("../engine/report.service");
const { getRoomById } = require("../data/campus-structure");
const { resolveRoomStatus } = require("../engine/decisionEngine.service");

// ─── Physical layout helpers ─────────────────────────────────────────────────

function findBuildingByClassroom(classroom) {

    return campusData.buildings
        ? campusData.buildings.find((building) => building.classrooms.includes(classroom))
        : undefined;

}

// ─── Engine integration ───────────────────────────────────────────────────────

/**
 * Resolves the real-time status of a classroom by combining:
 *  1. Timetable  — is there a scheduled lecture right now?
 *  2. Reports    — any recent verified crowd votes?
 *  3. Room config — seat count for occupancy%
 *
 * hasActiveReservation is always false for now; add a reservation
 * service here once that feature is built.
 *
 * @param {string} classroom - roomId, e.g. "MAIN-G-01"
 * @returns {Promise<{status, occupied, confidence, reason, occupancyPercent}>}
 */
async function getClassroomStatus(classroom) {

    const now = new Date();

    // JS getDay() returns 0 = Sunday … 6 = Saturday — same as timetable.
    const dayOfWeek = now.getDay();

    // Zero-pad hours/minutes so timeToMinutes parses correctly.
    const hours   = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const time    = `${hours}:${minutes}`;

    const busyClassrooms = timetableService.getBusyClassrooms(dayOfWeek, time);
    const timetableBusy  = busyClassrooms.includes(classroom);

    const reports = await reportService.getRecentReportsForRoom(classroom);

    // Seat count from the campus-structure catalog (null if unknown room).
    const roomConfig = getRoomById(classroom);
    const seats = roomConfig ? roomConfig.seats : null;

    return resolveRoomStatus({
        timetableBusy,
        hasActiveReservation: false,   // TODO: wire up reservation service
        reports,
        now,
        headcount: null,               // TODO: wire up headcount / CV data
        seats
    });

}

module.exports = {
    findBuildingByClassroom,
    getClassroomStatus
};