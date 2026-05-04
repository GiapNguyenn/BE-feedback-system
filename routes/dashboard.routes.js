const express = require("express");
const router = express.Router();
const adminController = require("../controllers/dashboard.controller");
const { authenticateToken, isAdmin, isTeacher, canAccessDashboard } = require("../middleware/authMiddleware");
const checkMaintenance = require("../middleware/maintenanceMiddleware"); // Import cầu chì vào

router.get("/", authenticateToken, checkMaintenance, canAccessDashboard, adminController.getDashboardStats);

module.exports = router;