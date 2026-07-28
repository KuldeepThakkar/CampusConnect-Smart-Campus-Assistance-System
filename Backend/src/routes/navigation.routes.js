const express = require("express");

const router = express.Router();

const navigationController = require("../controllers/navigation.controller");

const {validateNavigationRequest} = require("../validations/navigation.validation");

const {validateNextClassRequest} = require("../validations/timetable.validation");

router.post("/",validateNavigationRequest,navigationController.navigate);

router.post("/next-class",validateNextClassRequest,navigationController.navigateToNextClass);

module.exports = router;