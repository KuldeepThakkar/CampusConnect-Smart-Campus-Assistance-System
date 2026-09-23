const reservationService = require("../services/reservation.service");
const { successResponse, errorResponse } = require("../utils/response");

async function createReservation(req, res) {

    try {

        const { classroom, buildingId, date, startTime, endTime } = req.body;

        const result = await reservationService.createReservation(req.user._id, {
            classroom,
            buildingId,
            date,
            startTime,
            endTime
        });

        if (!result.success) {
            return res.status(400).json(errorResponse(result.message));
        }

        return res.status(201).json(
            successResponse(result.message, { reservation: result.reservation })
        );

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

async function getMyReservations(req, res) {

    try {

        const reservations = await reservationService.getTeacherReservationsToday(req.user._id);

        return res.status(200).json(
            successResponse("Today's reservations fetched", { reservations })
        );

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

async function cancelReservation(req, res) {

    try {

        const { id } = req.params;

        const result = await reservationService.cancelReservation(req.user._id, id);

        if (!result.success) {
            return res.status(404).json(errorResponse(result.message));
        }

        return res.status(200).json(successResponse(result.message));

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

module.exports = {
    createReservation,
    getMyReservations,
    cancelReservation
};