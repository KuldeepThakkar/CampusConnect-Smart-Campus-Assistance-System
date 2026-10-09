const express = require("express");
const router = express.Router();

const noticeController = require("../controllers/notice.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const {
    validateCreateNoticeRequest,
    validateMarkReadRequest
} = require("../validations/notice.validation");

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

router.post(
    "/read",
    authenticate,
    authorize("student"),
    validateMarkReadRequest,
    noticeController.markNoticesRead
);

router.delete(
    "/:id",
    authenticate,
    authorize("teacher"),
    noticeController.deleteNotice
);

module.exports = router;