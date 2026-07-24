const timetableService = require("../services/timetable.service");

function getAcademicOptions(req, res) {
    try {
        const academicOptions = timetableService.getAcademicOptions();

        res.status(200).json({
            success: true,
            data: academicOptions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

function getNextLecture(req, res) {
    try {
        const {
            department,
            branch,
            semester,
            division,
            currentDate
        } = req.body;

        const result = timetableService.getNextLecture(
            department,
            branch,
            Number(semester),
            division,
            currentDate ? new Date(currentDate) : new Date()
        );

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}

module.exports = {
    getAcademicOptions,
    getNextLecture
};