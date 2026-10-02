function validateCreateEventRequest(req, res, next) {

    const { eventName, eventDate, eventTime, location, coordinator } = req.body;

    if (!eventName) {
        return res.status(400).json({ success: false, message: "eventName is required" });
    }

    if (!eventDate) {
        return res.status(400).json({ success: false, message: "eventDate is required" });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
        return res.status(400).json({ success: false, message: "eventDate must be in YYYY-MM-DD format" });
    }

    if (!eventTime) {
        return res.status(400).json({ success: false, message: "eventTime is required" });
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(eventTime)) {
        return res.status(400).json({ success: false, message: "eventTime must be a valid HH:mm time" });
    }

    if (!location) {
        return res.status(400).json({ success: false, message: "location is required" });
    }

    if (!coordinator) {
        return res.status(400).json({ success: false, message: "coordinator is required" });
    }

    next();

}

module.exports = {
    validateCreateEventRequest
};