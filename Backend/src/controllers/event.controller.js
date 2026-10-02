const eventService = require("../services/event.service");
const { successResponse, errorResponse } = require("../utils/response");

async function createEvent(req, res) {

    try {

        const { eventName, eventDate, eventTime, location, description, coordinator } = req.body;

        const result = await eventService.createEvent(req.user._id, {
            eventName,
            eventDate,
            eventTime,
            location,
            description,
            coordinator
        });

        if (!result.success) {
            return res.status(400).json(errorResponse(result.message));
        }

        return res.status(201).json(
            successResponse(result.message, { event: result.event })
        );

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

async function getAllEvents(req, res) {

    try {

        const events = await eventService.getAllEvents();

        return res.status(200).json(
            successResponse("Events fetched successfully", { events })
        );

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

async function deleteEvent(req, res) {

    try {

        const { id } = req.params;

        const result = await eventService.deleteEvent(req.user, id);

        if (!result.success) {
            return res.status(404).json(errorResponse(result.message));
        }

        return res.status(200).json(successResponse(result.message));

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

module.exports = {
    createEvent,
    getAllEvents,
    deleteEvent
};