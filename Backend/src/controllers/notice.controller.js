const noticeService = require("../services/notice.service");
const { successResponse, errorResponse } = require("../utils/response");

async function createNotice(req, res) {

    try {

        const { title, message } = req.body;

        const result = await noticeService.createNotice(req.user, { title, message });

        return res.status(201).json(
            successResponse(result.message, { notice: result.notice })
        );

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

async function getAllNotices(req, res) {

    try {

        const notices = await noticeService.getAllNotices(req.user);

        return res.status(200).json(
            successResponse("Notices fetched successfully", { notices })
        );

    } catch (error) {

        return res.status(500).json(errorResponse(error.message));

    }

}

module.exports = {
    createNotice,
    getAllNotices
};