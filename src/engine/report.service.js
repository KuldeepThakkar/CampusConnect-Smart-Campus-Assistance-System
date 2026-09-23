const Report = require("./report.model");
const { OVERRIDE_WINDOW_MINUTES } = require("./decisionEngine.service");

/**
 * Records one crowd report. Mirrors reservation.service.js's shape:
 * validate first, return {success, message[, report]} rather than throwing.
 *
 * Does NOT itself decide whether the vote counts toward an override — that's
 * decisionEngine.service.js's job at read time, using verifiedNearRoom +
 * createdAt. This just guards against a user hammering the same report
 * repeatedly to make one opinion look like three.
 */
async function submitReport(userId, { classroom, type, verifiedNearRoom }) {

    if (!classroom || typeof classroom !== "string") {
        return { success: false, message: "classroom is required" };
    }

    if (type !== "empty" && type !== "occupied") {
        return { success: false, message: "type must be 'empty' or 'occupied'" };
    }

    const windowStart = new Date(Date.now() - OVERRIDE_WINDOW_MINUTES * 60 * 1000);

    // Anti-vote-stuffing: same user, same room, same window -> update their
    // existing report instead of creating a second one. This keeps
    // countEligibleVotes' per-user dedup meaningful even before it runs —
    // one user can't inflate the raw report count either.
    const existing = await Report.findOne({
        classroom,
        reportedBy: userId,
        createdAt: { $gte: windowStart }
    });

    if (existing) {
        existing.type = type;
        existing.verifiedNearRoom = Boolean(verifiedNearRoom);
        existing.createdAt = new Date(); // refresh recency
        await existing.save();
        return { success: true, message: "Report updated", report: existing };
    }

    const report = await Report.create({
        classroom,
        type,
        reportedBy: userId,
        verifiedNearRoom: Boolean(verifiedNearRoom)
    });

    return { success: true, message: "Report submitted", report };

}

/**
 * All reports for a room within the override window — exactly what
 * decisionEngine.service.js's resolveRoomStatus() expects as `reports`.
 */
async function getRecentReportsForRoom(classroom) {

    const windowStart = new Date(Date.now() - OVERRIDE_WINDOW_MINUTES * 60 * 1000);

    return Report.find({
        classroom,
        createdAt: { $gte: windowStart }
    });

}

module.exports = {
    submitReport,
    getRecentReportsForRoom
};
