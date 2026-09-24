const express = require("express");

const router = express.Router();

const timetableController = require("../controllers/timetable.controller");
const { validateDivisionRequest } = require("../validations/timetable.validation");

router.get("/options", timetableController.getAcademicOptions);

router.post("/next-lecture", validateDivisionRequest, timetableController.getNextLecture);

router.post("/today-lectures", validateDivisionRequest, timetableController.getTodayLectures);

module.exports = router;