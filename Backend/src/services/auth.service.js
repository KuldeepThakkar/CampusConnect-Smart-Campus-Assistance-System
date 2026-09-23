const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const { isAllowedDomain } = require("../utils/email.util");
const { generateOtp, getOtpExpiry } = require("../utils/otp.util");
const mailerService = require("./mailer.service");
const { generateToken } = require("../utils/jwt.util");

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

async function verifyOtp(email, code, adminCode) {

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {

        return {
            success: false,
            message: "No signup found for this email"
        };

    }

    if (user.isVerified) {

        return {
            success: false,
            message: "This account is already verified. Please log in."
        };

    }

    if (!user.otp.expiresAt || user.otp.expiresAt < new Date()) {

        return {
            success: false,
            message: "OTP has expired. Please sign up again to get a new code."
        };

    }

    if (user.otp.code !== code) {

        return {
            success: false,
            message: "Invalid OTP"
        };

    }

    if (user.role === "teacher" && user.otp.adminCode !== adminCode) {

        return {
            success: false,
            message: "Invalid admin approval code"
        };

    }

    user.isVerified = true;
    user.otp = { code: null, adminCode: null, expiresAt: null };

    await user.save();

    const token = generateToken(user);

    return {
        success: true,
        message: "Account verified successfully",
        token,
        user: {
            id: user._id,
            email: user.email,
            role: user.role
        }
    };

}

async function login(email, password) {

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {

        return {
            success: false,
            message: "Invalid email or password"
        };

    }

    if (!user.isVerified) {

        return {
            success: false,
            message: "Please verify your account before logging in"
        };

    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {

        return {
            success: false,
            message: "Invalid email or password"
        };

    }

    const token = generateToken(user);

    return {
        success: true,
        message: "Login successful",
        token,
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
            academicDetails: user.academicDetails
        }
    };

}

module.exports = {
    signup,
    verifyOtp,
    login
};