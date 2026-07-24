const timetableService = require("../services/timetable.service");

function getAcademicOptions(req, res) {
    try {
        const academicOptions = timetableService.getAcademicOptions();

        res.status(200).json({
            success: true,
            data: academicOptions
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to load academic options."
        });
    }
}

module.exports = {
    getAcademicOptions
};