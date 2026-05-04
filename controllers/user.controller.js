const { sql, poolPromise } = require("../config/db");
const { generateToken } = require("../helper/jwt");
const jwt = require("jsonwebtoken");
const xlsx = require("xlsx");
const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const paginationHelper = require("../helper/paginationHelper");
const userService = require("../services/user.service");
const { sendOTPEmail } = require("../services/email.service");
const helperSaveLog = require("../helper/logger");

//[httpPost : registerUser]
exports.register =  async (req, res) => {
 const { studentCode, email, fullName, password, roleId } = req.body;
  try {
    if(!email || !password || !studentCode || !fullName || !roleId) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ thông tin"
      });
    } 
    await userModel.register(studentCode,email,fullName,password,roleId);
    res.status(201).json({
      message: "Đăng ký thành công"
    });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message
    });
  }
};


exports.teacherCreateStudent = async (req, res) => {
  const { studentCode, email, fullName, password, classId } = req.body;
   try {
    // validate
    if (!email || !password || !fullName || !classId) {
      return res.status(400).json({
        error: "Thiếu dữ liệu bắt buộc"
      });
    }
    
    await userModel.teacherCreateStudent(studentCode, email, fullName, password, classId);
    res.status(201).json({
      message: "Giáo viên đã tạo và thêm sinh viên vào lớp thành công!"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};
exports.getStudentsInClass = async (req, res) => {
  const { classId } = req.params;
  const teacherId = req.user.id;
  const searchTerm = req.query.search || "";
  try {
    // pagination config
    let objectPagination = {
      currentPage: 1,
      limitItems: 10
    };
    // gọi helper trước (chưa có total)
    const tempPagination = paginationHelper(objectPagination, req.query, 0);
    // gọi model
    const result = await userModel.getStudentsInClass(classId,teacherId,searchTerm,tempPagination);
    // gọi lại pagination với total thật
    const pagination = paginationHelper(objectPagination,req.query,result.total); 
    res.json({success: true,data: result.students,pagination: pagination});

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

exports.getStudentsByTeacher = async (req, res) => {
  const teacherId = req.user.id;
  try {
    const data = await userModel.getStudentsByTeacher(teacherId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//[API POST : LOGIN]
//[API POST : LOGIN]
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Kiểm tra đầu vào cơ bản
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "Vui lòng nhập đầy đủ Email và Mật khẩu" 
    });
  }

  try {
    const user = await userModel.login(email, password);
    
    // Nếu hàm userModel.login trả về null hoặc ném lỗi khi sai pass
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Email hoặc mật khẩu không chính xác" 
      });
    }

    const token = generateToken(user);

    // 2. Trả về thành công với cấu trúc rõ ràng
    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công! Chào mừng " + user.fullName,
      token,
      user: { 
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.roleId === 1 ? 'admin' : (user.roleId === 2 ? 'student' : 'teacher'),
        studentCode: user.studentCode || null
      }
    });

  } catch (error) {
    // 3. Xử lý các loại lỗi khác nhau
    console.error("Login Error:", error.message);

    // Nếu lỗi do userModel ném ra (ví dụ: 'Invalid password')
    if (error.message.includes("password") || error.message.includes("user")) {
        return res.status(401).json({ 
            success: false, 
            message: "Thông tin đăng nhập không hợp lệ" 
        });
    }

    // Cuối cùng mới là lỗi máy chủ thật sự
    res.status(500).json({ 
      success: false, 
    });
  }
};

exports.getTeacherClasses = async (req, res) => {
    const teacherId = req.user.id; // Lấy từ Token  
    try {
        const data = await userModel.getTeacherClasses(teacherId);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } 
  };

exports.updateUser = async (req, res) => {
  try {
    const result = await userModel.updateUser(req.body);
    await helperSaveLog.saveLog({
      userId: req.user.id,
      level: 'INFO',
      action: 'Cập nhật thông tin',
      description: `Người dùng đã cập nhật thông tin cá nhân/tài khoản`,
      ipAddress: req.ip,
      metadata: req.body // Lưu lại data đã gửi lên để xem họ đổi cái gì
    });

    res.json({
      message: result.message
    });

  } catch (err) {

    if (err.originalError?.info?.message) {
      return res.status(400).json({
        message: err.originalError.info.message
      });
    }

    res.status(500).json({
      error: err.message
    });
  }
};

//[httpGet: AllUser]

exports.getUsers = async (req, res) => {
  try {
    const users = await userModel.getUsers();

    res.json(users);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

//[httpGet : SearchbyStudentCode]

exports.getUserByStudentCode = async (req, res) => {
  try {
    const { studentCode } = req.params;

    const data = await userModel.getUserByStudentCode(studentCode);

    if (users.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy user"
      });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

exports.uploadStudentsExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Vui lòng chọn file Excel"
            });
        }
        const { classId } = req.body;

        const result = await userService.importStudentsFromExcel(
            req.file.buffer,
            classId
        );
        await helperSaveLog.saveLog({
            userId: req.user.id,
            level: 'INFO',
            action: 'Import Excel',
            description: `Giáo viên đã import danh sách sinh viên. Kết quả - Thêm mới: ${result.inserted}, Cập nhật: ${result.updated}`,
            ipAddress: req.ip,
            metadata: { classId, total: result.total }
        });
        return res.json({
                success: true,
                message: "Import danh sách sinh viên thành công",
                data: {
                    inserted: result.inserted,
                    updated: result.updated,
                    total: result.total
                }
            });
    } catch (err) {
        if (err.message === "File Excel rỗng") {
           return res.status(400).json({
            success: false,
            message: err.message
        });
        }
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        // 1. Kiểm tra user có tồn tại không
        const user = await userModel.findByEmail(email);
        if (!user) return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });

        // 2. Tạo mã OTP 6 số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hash = await bcrypt.hash(otp, 10);
        const expiredAt = new Date(Date.now() + 10 * 60000); // Hết hạn sau 10 phút

        // 3. Lưu vào bảng OTP_Verifications (Dùng Transaction để an toàn)
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            // Vô hiệu hóa các mã cũ trước khi tạo mã mới
            await otpModel.deleteOldOTP(transaction, user.id); 
            await otpModel.insertOTP(transaction, {
                userId: user.id,
                hash: hash,
                type: 'FORGOT_PASSWORD',
                newEmail: null,
                expiredAt
            });
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }

        // 4. Gửi mail cho khách
        await sendOTPEmail(email, otp, "Mã khôi phục mật khẩu");

        res.json({ message: "Mã khôi phục đã được gửi vào Gmail của bạn" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// --- BƯỚC 2: XÁC NHẬN OTP VÀ ĐẶT LẠI PASS ---
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await userModel.findByEmail(email);
        if (!user) return res.status(404).json({ message: "User không tồn tại" });

        // 1. Tìm mã OTP mới nhất của user này
        const otpRes = await otpModel.findLatestOTP(user.id);
        const otpData = otpRes.recordset[0];

        if (!otpData || otpData.type !== 'FORGOT_PASSWORD') {
            return res.status(400).json({ message: "Yêu cầu không hợp lệ hoặc đã hết hạn" });
        }

        // 2. Kiểm tra hạn dùng
        if (new Date() > new Date(otpData.expiredAt)) {
            return res.status(400).json({ message: "Mã OTP đã hết hạn" });
        }

        // 3. Kiểm tra mã OTP
        const isMatch = await bcrypt.compare(otp, otpData.otpHash);
        if (!isMatch) {
            await otpModel.increaseAttempt(otpData.id);
            return res.status(400).json({ message: "Mã OTP không chính xác" });
        }

        // 4. Cập nhật mật khẩu mới cho User
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(newPassword, salt);
        
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            // Cập nhật pass trong bảng Users
            await pool.request()
                .input("uid", sql.Int, user.id)
                .input("pass", sql.VarChar, hashedPass)
                .query("UPDATE Users SET password = @pass WHERE id = @uid");

            // Đánh dấu OTP đã dùng
            await otpModel.markUsed(transaction, otpData.id);
            await transaction.commit();
            await helperSaveLog.saveLog({
              userId: user.id, // ID của sinh viên vừa tìm thấy bằng email
              level: 'WARNING',
              action: 'Khôi phục mật khẩu',
              description: `Sinh viên ${user.email} đã khôi phục mật khẩu thành công qua OTP`,
              ipAddress: req.ip || '127.0.0.1'
          });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }

        res.json({ message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống khi đặt lại mật khẩu" });
    }
};


