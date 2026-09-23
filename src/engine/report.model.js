const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        classroom: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ["empty", "occupied"],
            required: true
            // "empty"    -> user claims a scheduled/reserved room is actually free (cancellation report)
            // "occupied" -> user claims a room with no timetable/reservation is actually in use
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        verifiedNearRoom: {
            type: Boolean,
            required: true,
            default: false
            // Set by whatever location-verification step runs before this is saved
            // (QR checkpoint scan / geofence check). Unverified reports are still
            // stored for audit but never count toward the override threshold —
            // see decisionEngine.service.js.
        }
    },
    {
        timestamps: true
        // createdAt is what the 15-minute override window is measured against.
    }
);

// Hot query: "all reports for this room in the last N minutes"
reportSchema.index({ classroom: 1, createdAt: 1 });

module.exports = mongoose.model("Report", reportSchema);
