const authService = require("../services/auth.service");
const { successResponse, errorResponse } = require("../utils/response");

async function signup(req, res) {

    try {

        const { email, password, role } = req.body;

        const result = await authService.signup(email, password, role);

        if (!result.success) {
            return res.status(400).json(errorResponse(result.message));
        }

        return res.status(201).json(
            successResponse(result.message, { userId: result.userId })
        );

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

async function verifyOtp(req, res) {

    try {

        const { email, code, adminCode } = req.body;

        const result = await authService.verifyOtp(email, code, adminCode);

        if (!result.success) {
            return res.status(400).json(errorResponse(result.message));
        }

        return res.status(200).json(
            successResponse(result.message, { token: result.token, user: result.user })
        );

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

async function login(req, res) {

    try {

        const { email, password } = req.body;

        const result = await authService.login(email, password);

        if (!result.success) {
            return res.status(401).json(errorResponse(result.message));
        }

        return res.status(200).json(
            successResponse(result.message, { token: result.token, user: result.user })
        );

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

module.exports = {
    signup,
    verifyOtp,
    login
};