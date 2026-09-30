const express = require("express");

const router = express.Router();

const navigationController = require("../controllers/navigation.controller");

const {validateNavigationRequest} = require("../validations/navigation.validation");

router.post("/",validateNavigationRequest,navigationController.navigate);

module.exports = router;