const express = require("express");

const router = express.Router();

const teacherController =
  require("../controllers/teacher.controller");

const {
  authenticateToken,
  isAdmin
} = require("../middleware/authMiddleware");

/**
 * GET ALL
 */
router.get(
  "/",
  authenticateToken,
  isAdmin,
  teacherController.getTeachers
);

/**
 * CREATE
 */
router.post(
  "/",
  authenticateToken,
  isAdmin,
  teacherController.createTeacher
);

/**
 * DELETE
 */
router.delete(
  "/:id",
  authenticateToken,
  isAdmin,
  teacherController.deleteTeacher
);

module.exports = router;