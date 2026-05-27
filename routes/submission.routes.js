const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submission.controller");
const authorizeRoles = require("../middleware/roleMiddleware");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const rateLimit = require('express-rate-limit');

const submissionLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, 
  max: 1, 
  message: {
    success: false,
    message: "Hệ thống cần thời gian phân tích. Vui lòng đợi 2 phút giữa mỗi lần nộp bài!"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/upload", 
  authenticateToken, 
  submissionLimiter, 
  upload.single("file"), 
  submissionController.submitExercise
);
router.post("/:id/analyze",authenticateToken ,submissionController.analyzeSubmission);
router.get("/",authenticateToken,submissionController.getStudentSubmissions);
router.patch("/:id/pin", authenticateToken, submissionController.togglePin);
router.delete("/:id", authenticateToken, submissionController.deleteSubmission);
router.get('/code/:id', submissionController.getSubmissionCode);
router.get("/:id", authenticateToken, submissionController.getSubmissionDetail);

module.exports = router;
