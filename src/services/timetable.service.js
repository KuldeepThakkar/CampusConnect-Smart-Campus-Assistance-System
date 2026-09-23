// Timetable service
// Reads the dummy-timetable JSON (same shape as files/dummy-timetable.json)
// and exposes the one function the decision engine's resolveFromSignals()
// expects: getBusyClassrooms(day, time) → string[]
//
// Shape of each timetable entry:
//   { entryId, roomId, dayOfWeek (0=Sun…6=Sat), startTime "HH:MM", endTime "HH:MM", ... }

const path = require("path");
const { timeToMinutes } = require("../utils/time.util");

// ---------------------------------------------------------------------------
// Timetable data
// Replace / augment entries[] with your real department timetable.
// roomId MUST match a roomId in src/data/campus-structure.js.
// ---------------------------------------------------------------------------
const TIMETABLE_ENTRIES = require(path.join(__dirname, "../../files/dummy-timetable.json")).entries;

/**
 * Returns all roomIds that have a scheduled class right now.
 *
 * @param {number} dayOfWeek - 0 (Sunday) … 6 (Saturday)
 * @param {string} time      - current time as "HH:MM" (24-hour)
 * @returns {string[]}       - array of roomIds that are busy
 */
function getBusyClassrooms(dayOfWeek, time) {

    const nowMinutes = timeToMinutes(time);

    return TIMETABLE_ENTRIES
        .filter((entry) => {
            if (entry.dayOfWeek !== dayOfWeek) return false;
            const start = timeToMinutes(entry.startTime);
            const end   = timeToMinutes(entry.endTime);
            return nowMinutes >= start && nowMinutes < end;
        })
        .map((entry) => entry.roomId);

}

module.exports = { getBusyClassrooms };
