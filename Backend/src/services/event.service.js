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

// Sorted by date, newest-first — eventDate is "YYYY-MM-DD" so lexicographic
// descending sort is also chronologically correct, no parsing needed.
async function getAllEvents() {

    const events = await Event.find().sort({ eventDate: -1, eventTime: -1 });

    return events;

}

module.exports = {
    createEvent,
    getAllEvents
};