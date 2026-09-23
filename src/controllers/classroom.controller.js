const classroomService = require("../services/classroom.service");
const reportService = require("../engine/report.service");

/**
 * GET /api/classroom/:classroom/status
 *
 * Returns the decision-engine-resolved real-time status for a room.
 * Example response:
 *   { success: true, classroom: "MAIN-G-01", status: "FREE", occupied: false,
 *     confidence: "high", reason: "no schedule, no contradicting reports",
 *     occupancyPercent: null }
 */
async function getStatus(req, res) {

    const { classroom } = req.params;

    try {

        const result = await classroomService.getClassroomStatus(classroom);

        res.status(200).json({
            success: true,
            classroom,
            ...result
        });

    } catch (err) {

        console.error("[classroom.controller] getStatus error:", err);
        res.status(500).json({ success: false, message: "Failed to resolve classroom status" });

    }

}

/**
 * POST /api/classroom/:classroom/report
 *
 * Submit a crowd report for a room.
 * Body: { type: "empty"|"occupied", verifiedNearRoom: boolean, userId: string }
 *
 * userId should come from auth middleware (req.user._id) once that's wired up.
 * For now it is accepted in the body to keep the route auth-agnostic.
 */
async function submitReport(req, res) {

    const { classroom } = req.params;
    const { type, verifiedNearRoom, userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: "userId is required" });
    }

    try {

        const result = await reportService.submitReport(userId, {
            classroom,
            type,
            verifiedNearRoom: Boolean(verifiedNearRoom)
        });

        const statusCode = result.success ? 200 : 400;
        res.status(statusCode).json(result);

    } catch (err) {

        console.error("[classroom.controller] submitReport error:", err);
        res.status(500).json({ success: false, message: "Failed to submit report" });

    }

}

module.exports = { getStatus, submitReport };
