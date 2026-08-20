const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { validateSignupRequest, validateVerifyOtpRequest, validateLoginRequest } = require("../validations/auth.validation");

router.post("/signup", validateSignupRequest, authController.signup);

router.post("/verify-otp", validateVerifyOtpRequest, authController.verifyOtp);

router.post("/login", validateLoginRequest, authController.login);

module.exports = router;