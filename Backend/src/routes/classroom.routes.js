const express = require("express");
const router = express.Router();

const classroomController = require("../controllers/classroom.controller");
const { validateFreeClassroomsQuery, validateDayScheduleQuery } = require("../validations/classroom.validation");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get(
    "/free",
    authenticate,
    authorize("student", "teacher"),
    validateFreeClassroomsQuery,
    classroomController.getFreeClassrooms
);

router.get(
    "/schedule",
    authenticate,
    authorize("student", "teacher"),
    validateDayScheduleQuery,
    classroomController.getDaySchedule
);

module.exports = router;