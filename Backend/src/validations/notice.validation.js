const MAX_TITLE_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 1000;

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

module.exports = {
    validateCreateNoticeRequest
};