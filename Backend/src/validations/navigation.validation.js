function validateNavigationRequest(req, res, next) {

    const {
        latitude,
        longitude,
        classroom
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

    if (!classroom) {
        return res.status(400).json({
            success: false,
            message: "classroom is required"
        });
    }

    next();

}

module.exports = {
    validateNavigationRequest
};