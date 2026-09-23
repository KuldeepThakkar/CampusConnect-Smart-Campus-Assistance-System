/**
 * Converts a 24-hour time string "HH:MM" to total minutes from midnight.
 * Used by the timetable service to compare lecture windows numerically.
 *
 * @param {string} timeStr - e.g. "09:30"
 * @returns {number} minutes from midnight, e.g. 570
 */
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
}

module.exports = { timeToMinutes };
