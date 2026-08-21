const userService = require("../services/user.service");
const { successResponse, errorResponse } = require("../utils/response");

async function setAcademicDetails(req, res) {

    try {

        const result = await userService.setAcademicDetails(req.user._id, req.body);

        if (!result.success) {
            return res.status(400).json(errorResponse(result.message));
        }

        return res.status(200).json(successResponse(result.message, result.academicDetails));

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

async function adminUpdateAcademicDetails(req, res) {

    try {

        const result = await userService.adminUpdateAcademicDetails(req.params.userId, req.body);

        if (!result.success) {
            return res.status(400).json(errorResponse(result.message));
        }

        return res.status(200).json(successResponse(result.message, result.academicDetails));

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

async function getProfile(req, res) {

    try {

        const result = await userService.getProfile(req.user._id);

        if (!result.success) {
            return res.status(404).json(errorResponse(result.message));
        }

        return res.status(200).json(successResponse("Profile fetched", result.user));

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

module.exports = {
    setAcademicDetails,
    adminUpdateAcademicDetails,
    getProfile
};