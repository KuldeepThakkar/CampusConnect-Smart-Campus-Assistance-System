const express = require("express");

const router = express.Router();

const navigationController = require("../controllers/navigation.controller");

router.post("/", navigationController.navigate);

router.post(
    "/next-class",
    navigationController.navigateToNextClass
);

module.exports = router;