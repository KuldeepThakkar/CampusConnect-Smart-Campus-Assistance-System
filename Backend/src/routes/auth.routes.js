const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { validateSignupRequest } = require("../validations/auth.validation");

router.post("/signup", validateSignupRequest, authController.signup);

module.exports = router;