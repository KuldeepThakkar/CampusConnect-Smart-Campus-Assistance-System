const mongoose = require("mongoose");
const Notice = require("../models/notice.model");

async function createNotice(user, { title, message }) {

    const notice = await Notice.create({
        title,
        message,
        createdBy: user._id,
        createdByEmail: user.email
    });

    return {
        success: true,
        message: "Notice posted successfully",
        notice: toPublicNotice(notice)
    };

}

// Newest first. Students get an isRead flag per notice; everyone else gets
// plain notices. The readBy list is never sent to the client.
async function getAllNotices(user) {

    const notices = await Notice.find().sort({ createdAt: -1 });

    const isStudent = user.role === "student";
    const userId = user._id.toString();

    return notices.map((notice) => {

        const publicNotice = toPublicNotice(notice);

        if (isStudent) {
            publicNotice.isRead = notice.readBy.some((id) => id.toString() === userId);
        }

        return publicNotice;

    });

}

// Marks the given notices as read for this user. Idempotent: $addToSet only
// adds the user ID if it isn't already in readBy, so repeat calls change
// nothing. Malformed IDs are dropped instead of failing the whole request.
async function markNoticesRead(user, ids) {

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {

        return {
            success: true,
            message: "No notices to mark as read"
        };

    }

    await Notice.updateMany(
        { _id: { $in: validIds } },
        { $addToSet: { readBy: user._id } }
    );

    return {
        success: true,
        message: "Notices marked as read"
    };

}

// Only the teacher who posted the notice (or an admin) can delete it.
// A missing notice and someone else's notice return the same message, so
// IDs can't be probed to find out which notices exist.
async function deleteNotice(user, noticeId) {

    if (!mongoose.Types.ObjectId.isValid(noticeId)) {

        return {
            success: false,
            message: "Notice not found"
        };

    }

    const notice = await Notice.findById(noticeId);

    if (!notice) {

        return {
            success: false,
            message: "Notice not found"
        };

    }

    const isOwner = notice.createdBy.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {

        return {
            success: false,
            message: "Notice not found"
        };

    }

    await Notice.deleteOne({ _id: noticeId });

    return {
        success: true,
        message: "Notice deleted successfully"
    };

}

// Strips readBy so it can never leak through an API response.
function toPublicNotice(notice) {

    return {
        _id: notice._id,
        title: notice.title,
        message: notice.message,
        createdBy: notice.createdBy,
        createdByEmail: notice.createdByEmail,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt
    };

}

module.exports = {
    createNotice,
    getAllNotices,
    markNoticesRead,
    deleteNotice
};