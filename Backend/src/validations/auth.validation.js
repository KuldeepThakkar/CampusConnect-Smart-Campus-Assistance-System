function validateSignupRequest(req, res, next) {

    const { email, password, role } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "email is required" });
    }

    if (!password) {
        return res.status(400).json({ success: false, message: "password is required" });
    }

    if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ success: false, message: "password must be at least 6 characters" });
    }

    if (!role || !["student", "teacher"].includes(role)) {
        return res.status(400).json({ success: false, message: "role must be either student or teacher" });
    }

    next();

}

function validateVerifyOtpRequest(req, res, next) {

    const { email, code } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "email is required" });
    }

    if (!code) {
        return res.status(400).json({ success: false, message: "code is required" });
    }

    next();

}

function validateLoginRequest(req, res, next) {

    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "email is required" });
    }

    if (!password) {
        return res.status(400).json({ success: false, message: "password is required" });
    }

    next();

}

module.exports = {
    validateSignupRequest,
    validateVerifyOtpRequest,
    validateLoginRequest
};