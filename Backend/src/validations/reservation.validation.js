function isValidTimeFormat(time) {
    return typeof time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function validateCreateReservationRequest(req, res, next) {

    const { classroom, buildingId, date, startTime, endTime } = req.body;

    if (!classroom) {
        return res.status(400).json({ success: false, message: "classroom is required" });
    }

    if (!buildingId) {
        return res.status(400).json({ success: false, message: "buildingId is required" });
    }

    if (!date) {
        return res.status(400).json({ success: false, message: "date is required" });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ success: false, message: "date must be in YYYY-MM-DD format" });
    }

    if (!startTime || !isValidTimeFormat(startTime)) {
        return res.status(400).json({ success: false, message: "startTime must be a valid HH:mm time" });
    }

    if (!endTime || !isValidTimeFormat(endTime)) {
        return res.status(400).json({ success: false, message: "endTime must be a valid HH:mm time" });
    }

    next();

}

module.exports = {
    validateCreateReservationRequest
};