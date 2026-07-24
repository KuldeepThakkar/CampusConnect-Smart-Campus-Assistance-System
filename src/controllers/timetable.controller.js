const timetableService = require("../services/timetable.service");
const {successResponse,errorResponse} = require("../utils/response");

function getAcademicOptions(req, res) {

    try {

        const academicOptions = timetableService.getAcademicOptions();

        return res.status(200).json(
            successResponse(
                "Academic options fetched successfully",
                academicOptions
            )
        );

    } catch (error) {

        return res.status(500).json(
            errorResponse(error.message)
        );

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

        return res.status(200).json(
            successResponse(
                "Next lecture fetched successfully",
                result
            )
        );

    } catch (error) {

        return res.status(500).json(
            errorResponse(error.message)
        );

    }

}

module.exports = {
    getAcademicOptions,
    getNextLecture
};