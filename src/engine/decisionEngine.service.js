// Decision engine: takes the raw signals CampusConnect already has (timetable,
// reservation, crowd reports, headcount) and resolves them into ONE final
// room status, with a confidence level and a stated reason.
//
// Deliberately pure / DB-agnostic: every function here takes plain data in
// and returns plain data out. Nothing imports mongoose or the report model.
// That's what lets decisionEngine.test.js run with `node` alone, no DB
// connection required — we're not waiting on real data to validate the
// rules, only to calibrate the thresholds later.

const { timeToMinutes } = require("../utils/time.util");

// --- Tunable thresholds (calibrate against real usage later; see PROJECT notes) ---
const OVERRIDE_VOTE_THRESHOLD = 3;      // distinct verified votes needed to flip a status
const OVERRIDE_WINDOW_MINUTES = 15;     // how recent a vote must be to count
const OCCUPANCY_CAP_PERCENT = 100;      // count/seats is capped here, no overflow allowance

const STATUS = Object.freeze({
    RESERVED: "RESERVED",
    SCHEDULED: "SCHEDULED",
    REPORTED_FREE: "REPORTED_FREE",
    REPORTED_OCCUPIED: "REPORTED_OCCUPIED",
    FREE: "FREE",
    UNCERTAIN: "UNCERTAIN"
});

/**
 * Filters raw reports down to the ones that are eligible to count toward an
 * override: verified near the room, of the requested type, within the
 * window, and deduplicated per user (one vote per user counts once, no
 * matter how many times they voted — this is the anti-vote-stuffing rule).
 *
 * @param {Array} reports - [{ type, reportedBy, verifiedNearRoom, createdAt }]
 * @param {string} type - "empty" | "occupied"
 * @param {Date} now
 * @returns {number} distinct eligible voter count
 */
function countEligibleVotes(reports, type, now) {

    const windowStart = new Date(now.getTime() - OVERRIDE_WINDOW_MINUTES * 60 * 1000);
    const eligibleUserIds = new Set();

    (reports || []).forEach((report) => {

        if (report.type !== type) return;
        if (!report.verifiedNearRoom) return;

        const reportedAt = report.createdAt instanceof Date
            ? report.createdAt
            : new Date(report.createdAt);

        if (reportedAt < windowStart || reportedAt > now) return;

        eligibleUserIds.add(String(report.reportedBy));

    });

    return eligibleUserIds.size;

}

/**
 * Resolves the final status for one room at one instant.
 *
 * @param {Object} params
 * @param {boolean} params.timetableBusy - is there a scheduled lecture right now
 * @param {boolean} params.hasActiveReservation - is there an ad-hoc reservation right now
 * @param {Array}   params.reports - reports touching this room (any window; this
 *                  function does its own time filtering via `now`)
 * @param {Date}    [params.now]
 * @param {number}  [params.headcount] - optional manual/CV occupancy count
 * @param {number}  [params.seats] - room capacity, required if headcount is given
 * @returns {{status:string, occupied:boolean, confidence:'high'|'medium'|'low', reason:string, occupancyPercent:number|null}}
 */
function resolveRoomStatus({
    timetableBusy,
    hasActiveReservation,
    reports = [],
    now = new Date(),
    headcount = null,
    seats = null
}) {

    // Rule 1: an explicit reservation is a deliberate, recent teacher action —
    // it is never crowd-overridable.
    if (hasActiveReservation) {
        return finalize(STATUS.RESERVED, true, "high", "active reservation", headcount, seats);
    }

    if (timetableBusy) {

        const emptyVotes = countEligibleVotes(reports, "empty", now);

        // Rule 2/3: timetable says busy, but enough verified reports say the
        // class was cancelled -> flip to free.
        if (emptyVotes >= OVERRIDE_VOTE_THRESHOLD) {
            return finalize(
                STATUS.REPORTED_FREE,
                false,
                "medium",
                `${emptyVotes} verified reports in last ${OVERRIDE_WINDOW_MINUTES}min override scheduled class`,
                headcount,
                seats
            );
        }

        return finalize(STATUS.SCHEDULED, true, "high", "scheduled in timetable", headcount, seats);

    }

    // Timetable + reservation both say free from here down.
    const occupiedVotes = countEligibleVotes(reports, "occupied", now);

    // Rule 4: nothing scheduled, but enough verified reports say people are
    // actually using the room (unofficial/ad-hoc use).
    if (occupiedVotes >= OVERRIDE_VOTE_THRESHOLD) {
        return finalize(
            STATUS.REPORTED_OCCUPIED,
            true,
            "medium",
            `${occupiedVotes} verified reports in last ${OVERRIDE_WINDOW_MINUTES}min report unscheduled use`,
            headcount,
            seats
        );
    }

    // Rule 5: nothing scheduled, no credible contradicting reports.
    return finalize(STATUS.FREE, false, "high", "no schedule, no contradicting reports", headcount, seats);

}

function finalize(status, occupied, confidence, reason, headcount, seats) {

    let occupancyPercent = null;

    if (typeof headcount === "number" && typeof seats === "number" && seats > 0) {
        occupancyPercent = Math.min(
            OCCUPANCY_CAP_PERCENT,
            Math.round((headcount / seats) * 100)
        );
    }

    return { status, occupied, confidence, reason, occupancyPercent };

}

/**
 * Convenience wrapper: derives timetableBusy from the existing
 * timetableService.isClassroomBusyInRange-style check and hasActiveReservation
 * from a single reservation record, so callers (e.g. freeClassroom.service.js)
 * don't have to hand-build the boolean flags themselves.
 */
function resolveFromSignals({ day, time, classroom, timetableService, reservation, reports, now, headcount, seats }) {

    const timetableBusy = timetableService
        .getBusyClassrooms(day, time)
        .includes(classroom);

    const hasActiveReservation = Boolean(reservation);

    return resolveRoomStatus({
        timetableBusy,
        hasActiveReservation,
        reports,
        now,
        headcount,
        seats
    });

}

module.exports = {
    STATUS,
    OVERRIDE_VOTE_THRESHOLD,
    OVERRIDE_WINDOW_MINUTES,
    OCCUPANCY_CAP_PERCENT,
    countEligibleVotes,
    resolveRoomStatus,
    resolveFromSignals
};
