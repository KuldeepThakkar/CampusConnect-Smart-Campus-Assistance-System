function validateDivisionRequest(req, res, next) {

    const {
        department,
        branch,
        semester,
        division
    } = req.body;

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
    validateDivisionRequest
};