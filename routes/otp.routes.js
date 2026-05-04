const express = require("express");
const router = express.Router();
const otpController = require("../controllers/otp.controller");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/request", authenticateToken, otpController.requestOTP);
router.post("/verify", authenticateToken, otpController.verifyOTP);


module.exports = router;