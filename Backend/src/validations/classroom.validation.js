const VALID_DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

function validateFreeClassroomsQuery(req, res, next) {

    let { day, time } = req.query;

    // Defaults: today + now
    if (!day) {
        day = new Date().toLocaleDateString("en-US", { weekday: "long" });
    }

    if (!time) {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, "0");
        const m = String(now.getMinutes()).padStart(2, "0");
        time = `${h}:${m}`;
    }

    if (!VALID_DAYS.includes(day)) {
        return res.status(400).json({
            success: false,
            message: `day must be one of: ${VALID_DAYS.join(", ")}`
        });
    }

    // basic HH:MM check
    if (!/^\d{1,2}:\d{2}$/.test(time)) {
        return res.status(400).json({
            success: false,
            message: "time must be in HH:MM format (e.g. 09:30)"
        });
    }

    req.query.day = day;
    req.query.time = time;

    req.query.building = req.query.building || null;

    next();

}

function validateDayScheduleQuery(req, res, next) {

    let { day, building } = req.query;

    if (!day) {
        day = new Date().toLocaleDateString("en-US", { weekday: "long" });
    }

    if (!VALID_DAYS.includes(day)) {
        return res.status(400).json({
            success: false,
            message: `day must be one of: ${VALID_DAYS.join(", ")}`
        });
    }

    req.query.day = day;
    req.query.building = building || null;

    next();

}

module.exports = {
    validateFreeClassroomsQuery,
    validateDayScheduleQuery
};