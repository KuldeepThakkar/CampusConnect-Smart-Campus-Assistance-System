const express = require("express");
const router = express.Router();

const noticeController = require("../controllers/notice.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validateCreateNoticeRequest } = require("../validations/notice.validation");

router.post(
    "/",
    authenticate,
    authorize("teacher"),
    validateCreateNoticeRequest,
    noticeController.createNotice
);

router.get(
    "/",
    authenticate,
    noticeController.getAllNotices
);

module.exports = router;