const express = require("express");
const router = express.Router();
const classroomController = require("../controllers/classroom.controller");

// GET  /api/classroom/:classroom/status  — real-time resolved status
router.get("/:classroom/status", classroomController.getStatus);

// POST /api/classroom/:classroom/report  — submit a crowd report
router.post("/:classroom/report", classroomController.submitReport);

module.exports = router;
