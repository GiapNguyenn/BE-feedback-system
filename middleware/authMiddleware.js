const jwt = require("jsonwebtoken");
const settingModel = require("../models/setting.model");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Không có token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token không hợp lệ" });
    }

    let roleName = "";
    if (user.roleId === 1) roleName = "admin";
    else if (user.roleId === 2) roleName = "student"; // Trong ảnh ID 2 là student
    else if (user.roleId === 3 || user.roleId === 4) roleName = "teacher"; // ID 3 hoặc 4 đều là teacher

    req.user = {
      id: user.id,
      email: user.email,
      role: roleName,
      studentCode: user.studentCode
    };

    next();
  });
};

//  Kiểm tra quyền Giáo viên (Dùng cho API tạo lớp, thêm sinh viên)
const isTeacher = (req, res, next) => {
  // Cho phép cả Teacher và Admin vào
  if (!req.user || (req.user.role !== "teacher" && req.user.role !== "admin")) {
    return res.status(403).json({ message: "Quyền này chỉ dành cho Giáo viên!" });
  }
  next();
};

//  Kiểm tra quyền Admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Quyền này chỉ dành cho Admin!" });
  }
  next();
};
// kiểm tra quyền của admin và giáo viên 
const canAccessDashboard = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "teacher")) {
    next();
  } else {
    res.status(403).json({ message: "Bạn không có quyền truy cập thống kê!" });
  }
};

const checkMaintenance = async (req, res, next) => {
    // 1. Lấy giá trị từ bảng SystemSettings
    const maintenanceMode = await settingModel.getSetting('MAINTENANCE_MODE');

    // 2. Nếu đang bật bảo trì (true) và người dùng KHÔNG phải Admin
    if (maintenanceMode === 'true' && req.user?.role !== 'admin') {
        return res.status(503).json({
            success: false,
            isMaintenance: true,
            message: "Hệ thống đang bảo trì, vui lòng quay lại sau!"
        });
    }
    next();
};

module.exports = { authenticateToken, isAdmin, isTeacher, canAccessDashboard,checkMaintenance };