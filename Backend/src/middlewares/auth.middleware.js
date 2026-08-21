const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function authenticate(req, res, next) {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Authentication token missing" });
        }

        const token = authHeader.split(" ")[1];

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: "User no longer exists" });
        }

        req.user = user;

        next();

    } catch (error) {

        return res.status(500).json({ success: false, message: error.message });

    }

}

function authorize(...allowedRoles) {

    return (req, res, next) => {

        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "You do not have permission to perform this action" });
        }

        next();

    };

}

module.exports = {
    authenticate,
    authorize
};