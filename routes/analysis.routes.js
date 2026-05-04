const express = require("express");
const router = express.Router();
const analysisController = require("../controllers/analysis.controller");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get(
  "/history/:id",
  authenticateToken,
  analysisController.getAnalysisHistory
);

router.post(
  "/:analysisId/chat",
  authenticateToken,
  analysisController.chatAnalysis
);

router.get(
  "/:analysisId/chat",
  authenticateToken,
  analysisController.getAnalysisChat
);

module.exports = router;