const express = require("express");
const router = express.Router();

const eventController = require("../controllers/event.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validateCreateEventRequest } = require("../validations/event.validation");

router.post(
    "/",
    authenticate,
    authorize("teacher"),
    validateCreateEventRequest,
    eventController.createEvent
);

router.get(
    "/",
    authenticate,
    eventController.getAllEvents
);

router.delete(
    "/:id",
    authenticate,
    authorize("teacher"),
    eventController.deleteEvent
);

module.exports = router;