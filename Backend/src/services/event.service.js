const Event = require("../models/event.model");

async function createEvent(createdById, { eventName, eventDate, eventTime, location, description, coordinator }) {

    const todayDateStr = new Date().toLocaleDateString("en-CA");

    if (eventDate < todayDateStr) {

        return {
            success: false,
            message: "Event date cannot be in the past"
        };

    }

    const event = await Event.create({
        eventName,
        eventDate,
        eventTime,
        location,
        description,
        coordinator,
        createdBy: createdById
    });

    return {
        success: true,
        message: "Event created successfully",
        event
    };

}

async function getAllEvents() {

    const events = await Event.find().sort({ eventDate: -1, eventTime: -1 });

    return events;

}

async function deleteEvent(user, eventId) {

    const event = await Event.findById(eventId);

    if (!event) {

        return {
            success: false,
            message: "Event not found"
        };

    }

    const isOwner = event.createdBy.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {

        return {
            success: false,
            message: "Event not found"
        };

    }

    await Event.deleteOne({ _id: eventId });

    return {
        success: true,
        message: "Event deleted successfully"
    };

}

module.exports = {
    createEvent,
    getAllEvents,
    deleteEvent
};