const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const { isAllowedDomain } = require("../utils/email.util");
const { generateOtp, getOtpExpiry } = require("../utils/otp.util");
const mailerService = require("./mailer.service");

const SALT_ROUNDS = 10;

async function signup(email, password, role) {

    const normalizedEmail = email.trim().toLowerCase();

    if (!isAllowedDomain(normalizedEmail)) {

        return {
            success: false,
            message: "Only Indus University email addresses are allowed"
        };

    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.isVerified) {

        return {
            success: false,
            message: "An account with this email already exists"
        };

    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const code = generateOtp();
    const adminCode = role === "teacher" ? generateOtp() : null;
    const expiresAt = getOtpExpiry();

    let user;

    if (existingUser) {

        existingUser.password = hashedPassword;
        existingUser.role = role;
        existingUser.otp = { code, adminCode, expiresAt };

        user = await existingUser.save();

    } else {

        user = await User.create({
            email: normalizedEmail,
            password: hashedPassword,
            role,
            otp: { code, adminCode, expiresAt }
        });

    }

    await mailerService.sendMail(
        normalizedEmail,
        "Verify your CampusConnect account",
        `Welcome to CampusConnect! Here's your OTP: ${code}\n\nThis code expires in 10 minutes.`
    );

    if (role === "teacher") {

        await mailerService.sendMail(
            process.env.ADMIN_EMAIL,
            "Teacher signup approval needed",
            `A teacher account signup was requested for ${normalizedEmail}.\n\nApproval code: ${adminCode}\n\nOnly share this code with them if you recognize this request. Expires in 10 minutes.`
        );

    }

    return {
        success: true,
        message: role === "teacher"
            ? "OTP sent to your email. A second approval code has been sent to the admin."
            : "OTP sent to your email.",
        userId: user._id
    };

}

module.exports = {
    signup
};