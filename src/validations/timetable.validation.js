function validateNextClassRequest(req, res, next) {

    const {
        latitude,
        longitude,
        department,
        branch,
        semester,
        division
    } = req.body;

    if (latitude === undefined) {
        return res.status(400).json({
            success: false,
            message: "latitude is required"
        });
    }

    if (typeof latitude !== "number") {
        return res.status(400).json({
            success: false,
            message: "latitude must be a number"
        });
    }

    if (longitude === undefined) {
        return res.status(400).json({
            success: false,
            message: "longitude is required"
        });
    }

    if (typeof longitude !== "number") {
        return res.status(400).json({
            success: false,
            message: "longitude must be a number"
        });
    }

    if (!department) {
        return res.status(400).json({
            success: false,
            message: "department is required"
        });
    }

    if (!branch) {
        return res.status(400).json({
            success: false,
            message: "branch is required"
        });
    }

    if (semester === undefined) {
        return res.status(400).json({
            success: false,
            message: "semester is required"
        });
    }

    if (typeof semester !== "number") {
        return res.status(400).json({
            success: false,
            message: "semester must be a number"
        });
    }

    if (!division) {
        return res.status(400).json({
            success: false,
            message: "division is required"
        });
    }

    next();

}

module.exports = {
    validateNextClassRequest
};