const express = require('express');
const router = express.Router();
const progressController = require('../controllers/learningProgress.controller');
const { authenticateToken, isTeacher } = require('../middleware/authMiddleware'); 

//API lấy danh sách cảnh báo sớm (Dùng Procedure sp_GetStudentRiskAssessment)

router.get('/risk-assessment', authenticateToken, isTeacher, progressController.getRiskAssessment);

//API lấy lịch sử chi tiết 1 sinh viên để vẽ biểu đồ

router.get('/student-history/:userId', authenticateToken, isTeacher, progressController.getStudentHistory);

// API gửi thông báo nhắc nhở hàng loạt

router.post('/remind-bulk', authenticateToken, isTeacher, progressController.sendBulkReminders);

module.exports = router;