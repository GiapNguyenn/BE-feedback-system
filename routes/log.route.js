const express = require("express");
const router = express.Router();
const logController = require("../controllers/log.controller");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");


router.get("/system-logs", authenticateToken,isAdmin, logController.getSystemLogs);

module.exports = router;