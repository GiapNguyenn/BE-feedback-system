const multer = require("multer");
const path = require("path");

// 1. Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Đảm bảo thư mục "uploads" đã được tạo thủ công
    },
    filename: function (req, file, cb) {
        // Thêm timestamp để tránh trùng tên file
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// 2. Bộ lọc bảo mật
const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 2 * 1024 * 1024 // 💡 CHẶN SPAM: Chỉ cho phép file tối đa 2MB
    },
    fileFilter: (req, file, cb) => {
        // Lấy đuôi file
        const fileExt = path.extname(file.originalname).toLowerCase();
        
        // CHẶN TREO HỆ THỐNG: Chỉ nhận các định dạng code phổ biến
        const allowedExtensions = [".zip", ".py", ".js", ".cs", ".cpp", ".java"];

        if (allowedExtensions.includes(fileExt)) {
            cb(null, true);
        } else {
            // Trả về lỗi nếu sinh viên nộp file lạ (.exe, .mp4, .rar...)
            cb(new Error("Hệ thống chỉ nhận file .zip hoặc file code (.py, .js, .cs, .cpp, .java)"), false);
        }
    }
});

module.exports = upload;