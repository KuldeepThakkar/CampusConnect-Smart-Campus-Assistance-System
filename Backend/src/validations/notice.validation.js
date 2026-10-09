const MAX_TITLE_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_IDS_PER_REQUEST = 100;

function validateCreateNoticeRequest(req, res, next) {

    const { title, message } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ success: false, message: "title is required" });
    }

    if (title.trim().length > MAX_TITLE_LENGTH) {
        return res.status(400).json({
            success: false,
            message: `title must be at most ${MAX_TITLE_LENGTH} characters`
        });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ success: false, message: "message is required" });
    }

    if (message.trim().length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({
            success: false,
            message: `message must be at most ${MAX_MESSAGE_LENGTH} characters`
        });
    }

    next();

}

function validateMarkReadRequest(req, res, next) {

    const { ids } = req.body;

    if (!Array.isArray(ids)) {
        return res.status(400).json({ success: false, message: "ids must be an array" });
    }

    if (ids.length === 0) {
        return res.status(400).json({ success: false, message: "ids must not be empty" });
    }

    if (ids.length > MAX_IDS_PER_REQUEST) {
        return res.status(400).json({
            success: false,
            message: `ids must contain at most ${MAX_IDS_PER_REQUEST} items`
        });
    }

    if (!ids.every((id) => typeof id === "string")) {
        return res.status(400).json({ success: false, message: "ids must be strings" });
    }

    next();

}

module.exports = {
    validateCreateNoticeRequest,
    validateMarkReadRequest
};