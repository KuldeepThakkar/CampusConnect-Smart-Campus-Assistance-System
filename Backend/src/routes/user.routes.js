const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validateSetAcademicDetailsRequest } = require("../validations/user.validation");

router.post(
    "/academic-details",
    authenticate,
    authorize("student"),
    validateSetAcademicDetailsRequest,
    userController.setAcademicDetails
);

router.patch(
    "/academic-details/:userId",
    authenticate,
    authorize("admin"),
    userController.adminUpdateAcademicDetails
);

module.exports = router;