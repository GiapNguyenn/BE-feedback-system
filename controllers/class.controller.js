const sql = require("mssql");
const { poolPromise } = require("../config/db");
const classModel = require("../models/class.model");


exports.createClass = async (req, res) => {
    const { className } = req.body;
    const teacherId = req.user.id;
    try {
        const data = await classModel.createClass(className, teacherId);
        res.status(201).json({ success: true, message: "Tạo lớp học thành công!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
exports.getTeacherClasses = async (req, res) => {
    const teacherId = req.user.id; // Lấy từ Token  
    try {
        const data = await classModel.getTeacherClasses(teacherId);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } 
  };
exports.deleteClass = async (req, res) => {
  const { classId } = req.params;
  const teacherId = req.user.id;

  try {
    await classModel.deleteClass(classId, teacherId);

    res.json({
      message: "Xoá lớp thành công"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};
exports.deleteMultiple = async (req, res) => {
  try {
    const { classIds } = req.body; // Mảng [1, 2, 3...] từ Frontend
    const teacherId = req.user.id; // ID giáo viên từ token

    if (!classIds || !Array.isArray(classIds)) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    await classModel.deleteMultipleClasses(classIds, teacherId);
    
    res.json({ success: true, message: `Đã xoá ${classIds.length} lớp thành công!` });
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi khi xoá nhiều lớp" });
  }
};