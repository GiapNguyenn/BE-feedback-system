const express = require("express");
const router = express.Router();
const settingController = require("../controllers/setting.controller");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

// Lấy trạng thái: GET /api/admin/setting/maintenance-status
router.get("/maintenance-status", settingController.getMaintenanceStatus);

// Cập nhật trạng thái: POST /api/admin/setting/toggle-maintenance
router.post("/toggle-maintenance", authenticateToken, isAdmin, settingController.updateMaintenanceStatus);

module.exports = router;