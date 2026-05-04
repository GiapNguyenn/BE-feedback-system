const bcrypt = require("bcrypt");
const paginationHelper = require("../helper/paginationHelper");
const helperSaveLog = require("../helper/logger");

const adminTeacherController =
  require("../models/teacher.model");

/**
 * GET ALL
 */
const getTeachers = async (req, res) => {
  try {
    // 1. Khởi tạo đối tượng phân trang mặc định
    let objectPagination = {
      currentPage: 1,
      limitItems: 10, // Số giáo viên trên mỗi trang
    };

    // 2. Lấy tổng số giáo viên (để tính totalPage)
    // Giáp nên viết thêm 1 hàm countTeachers() trong model hoặc lấy từ totalCount ở bước trên
    const teachersRaw = await adminTeacherController.getAllTeachers(0, 100000); 
    const countTeachers = teachersRaw.length; 

    // 3. Sử dụng Helper của Giáp để tính toán skip/totalPage
    objectPagination = paginationHelper(objectPagination, req.query, countTeachers);

    // 4. Lấy dữ liệu thực tế theo trang
    const teachers = await adminTeacherController.getAllTeachers(
      objectPagination.skip, 
      objectPagination.limitItems
    );

    res.json({
      success: true,
      data: teachers,
      pagination: {
        currentPage: objectPagination.currentPage,
        totalPage: objectPagination.totalPage,
        limitItems: objectPagination.limitItems
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

/**
 * CREATE
 */
const createTeacher = async (req, res) => {

  try {

    const {
      fullName,
      email,
      password
    } = req.body;

    /**
     * CHECK EMAIL
     */
    const existingEmail =
      await adminTeacherController.findTeacherByEmail(email);
          await helperSaveLog.saveLog({
            userId: req.user.id,
            level: 'INFO',
            action: 'Tạo giáo viên',
            description: `Admin đã tạo tài khoản giáo viên mới: ${fullName} (${email})`,
            ipAddress: req.ip
          });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại"
      });
    }

    /**
     * HASH PASSWORD
     */
    const hashedPassword =
      await bcrypt.hash(password, 10);

    /**
     * CREATE
     */
    await adminTeacherController.createTeacher(
      fullName,
      email,
      hashedPassword
    );

    res.json({
      success: true,
      message: "Tạo giáo viên thành công"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });

  }
};

/**
 * DELETE
 */
const deleteTeacher = async (req, res) => {

  try {

    const { id } = req.params;

    await adminTeacherController.deleteTeacher(id);

    res.json({
      success: true,
      message: "Xóa giáo viên thành công"
    });

  } catch (err) {

    console.error(err);

    res.status(400).json({
      success: false,
      message: err.message
    });

  }
};

module.exports = {
  getTeachers,
  createTeacher,
  deleteTeacher
};