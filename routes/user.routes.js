const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authorizeRoles = require("../middleware/roleMiddleware");
const multer = require("multer"); 
const { authenticateToken, isAdmin, isTeacher } = require("../middleware/authMiddleware");
const checkMaintenance = require("../middleware/maintenanceMiddleware"); 
const upload = multer({ storage: multer.memoryStorage() });

router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/login", userController.login);
router.post("/register", userController.register);

router.use(authenticateToken);
router.use(checkMaintenance);

router.get("/",authenticateToken, isAdmin, userController.getUsers);
router.put("/update", authenticateToken, isAdmin,userController.updateUser);
router.get("/:studentCode",authenticateToken, isAdmin, userController.getUserByStudentCode);
router.get('/teacher/class/:classId/students', authenticateToken, isTeacher, userController.getStudentsInClass);
router.post('/teacher/create-student', authenticateToken,isTeacher, userController.teacherCreateStudent);
router.post("/teacher/upload-excel", 
    authenticateToken, 
    isTeacher, 
    upload.single('file'), // 'file' là tên field bên React gửi lên
    userController.uploadStudentsExcel
);


module.exports = router;