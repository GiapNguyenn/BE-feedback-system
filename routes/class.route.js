const express = require("express");
const router = express.Router();
const classController = require("../controllers/class.controller");
const authorizeRoles = require("../middleware/roleMiddleware");
const multer = require("multer"); 
const { authenticateToken, isAdmin, isTeacher } = require("../middleware/authMiddleware");
const upload = multer({ storage: multer.memoryStorage() });



router.get("/teacher/classes", authenticateToken, isTeacher, classController.getTeacherClasses);
router.post("/teacher/create-class", authenticateToken, isTeacher, classController.createClass);
router.post("/teacher/delete-multiple", authenticateToken, isTeacher, classController.deleteMultiple);
router.delete("/teacher/:classId", authenticateToken, isTeacher, classController.deleteClass);

module.exports = router;