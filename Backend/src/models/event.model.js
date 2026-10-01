const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        eventName: {
            type: String,
            required: true,
            trim: true
        },
        eventDate: {
            type: String,
            required: true
            // "YYYY-MM-DD" — same convention as reservation.model.js's date field
        },
        eventTime: {
            type: String,
            required: true
            // "HH:mm", 24-hour — same convention as reservation/timetable times
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        coordinator: {
            type: String,
            required: true,
            trim: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Speeds up "list all events sorted by date" — the only query pattern
// getAllEvents needs (EV.2).
eventSchema.index({ eventDate: 1 });

module.exports = mongoose.model("Event", eventSchema);