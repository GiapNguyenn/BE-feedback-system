const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedback.controller");
const { authenticateToken, isTeacher } = require("../middleware/authMiddleware");



router.get("/draft/:submissionId",authenticateToken,isTeacher,feedbackController.getFeedbackDraft);
router.post("/save",authenticateToken,isTeacher,feedbackController.saveOfficialFeedback);
router.get("/admin/all", authenticateToken, isTeacher, feedbackController.getAllSubmissionsForAdmin);
router.get("/classes", authenticateToken, isTeacher, feedbackController.getAllClasses);
router.get("/notifications", authenticateToken, feedbackController.getStudentNotifications);
router.put("/notifications/:id/read", authenticateToken, feedbackController.markAsRead);


module.exports = router;