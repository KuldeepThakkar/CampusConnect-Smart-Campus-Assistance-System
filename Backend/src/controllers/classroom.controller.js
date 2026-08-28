const freeClassroomService = require("../services/freeClassroom.service");
const { successResponse, errorResponse } = require("../utils/response");

function getFreeClassrooms(req, res) {

    try {

        const { day, time } = req.query;

        const result = freeClassroomService.getFreeClassrooms(day, time);

        return res.status(200).json(
            successResponse("Free classrooms fetched", result)
        );

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

module.exports = {
    getFreeClassrooms
};