function validateSetAcademicDetailsRequest(req, res, next) {

    const { department, branch, semester, division } = req.body;

    if (!department || !branch || !division) {
        return res.status(400).json({ success: false, message: "department, branch, and division are required" });
    }

    if (semester === undefined || typeof semester !== "number") {
        return res.status(400).json({ success: false, message: "semester is required and must be a number" });
    }

    next();

}

module.exports = {
    validateSetAcademicDetailsRequest
};