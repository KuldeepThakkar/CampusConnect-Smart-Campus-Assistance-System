const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
            // The teacher (or admin) who posted the notice. Set server-side
            // from req.user, never taken from the request body.
        },
        createdByEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
            // The user model has no name field, so "Posted by" shows the
            // email. Stored on the notice itself so the board never needs a
            // populate() call, and so the author's email still shows even if
            // that account is later removed.
        },
        readBy: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
            default: [],
            index: true
            // IDs of students who have seen this notice. Stored on the
            // server so "seen" persists across devices. Never sent to
            // students (NB.2 returns only an isRead flag).
        }
    },
    {
        timestamps: true
    }
);

// "Newest first" is the only listing order the board needs (NB.2).
noticeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notice", noticeSchema);