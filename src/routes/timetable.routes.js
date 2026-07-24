const express = require("express");

const router = express.Router();

const timetableController = require("../controllers/timetable.controller");

router.get("/options", timetableController.getAcademicOptions);

module.exports = router;