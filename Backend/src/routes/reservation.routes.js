const express = require("express");
const router = express.Router();

const reservationController = require("../controllers/reservation.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validateCreateReservationRequest } = require("../validations/reservation.validation");

router.post(
    "/",
    authenticate,
    authorize("teacher"),
    validateCreateReservationRequest,
    reservationController.createReservation
);

router.get(
    "/me",
    authenticate,
    authorize("teacher"),
    reservationController.getMyReservations
);

module.exports = router;