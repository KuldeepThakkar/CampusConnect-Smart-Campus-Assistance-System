const express = require("express");

const router = express.Router();

const campusController = require("../controllers/campus.controller");

router.get("/", campusController.getCampus);

router.get("/graph", campusController.getGraph);

module.exports = router;