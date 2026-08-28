const express = require("express");
const router = express.Router();

const classroomController = require("../controllers/classroom.controller");
const { validateFreeClassroomsQuery } = require("../validations/classroom.validation");

router.get(
    "/free",
    validateFreeClassroomsQuery,
    classroomController.getFreeClassrooms
);

module.exports = router;