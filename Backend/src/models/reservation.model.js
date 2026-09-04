const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        classroom: {
            type: String,
            required: true,
            trim: true
        },
        buildingId: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
            // "YYYY-MM-DD" — matches the currentDate format already used
            // by navigation/timetable endpoints. Every reservation is for
            // today's date only (enforced in the service layer, not here).
        },
        day: {
            type: String,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            required: true
            // Derived from `date` at creation time, stored redundantly so
            // range-overlap checks against timetable.json (which is keyed
            // by day name) don't need to re-derive it every time.
        },
        startTime: {
            type: String,
            required: true
            // "HH:mm", 24-hour — same convention as timetable.json entries
        },
        endTime: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Speeds up the two hot queries: "all reservations for this room today"
// (conflict checks) and "all of today's reservations" (free-classroom filtering).
reservationSchema.index({ date: 1, classroom: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);