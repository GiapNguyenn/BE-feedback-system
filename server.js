const express = require("express");
const cors = require("cors");

const multer = require("multer");
const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const submissionRoutes = require("./routes/submission.routes");
const analysisRoutes = require("./routes/analysis.routes");
const feedbackRoutes = require("./routes/Feedback.route");
const classRoutes = require("./routes/class.route");
const otpRoutes = require("./routes/otp.routes");
const teacherRoutes = require("./routes/teacher.routes");
const logSystems = require("./routes/log.route")
const progressRoutes = require('./routes/learningProgress.routes');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const checkMaintenance = require("./middleware/maintenanceMiddleware");
const adminSetting = require("./routes/setting.route")

const app = express();

app.use(cors({
  origin: '*', // Hoặc danh sách các domain được phép
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use("/api/otp", otpRoutes);
app.use("/api/admin/teachers",teacherRoutes);
app.use("/api/admin",logSystems)
app.use("/api/admin/setting", adminSetting)


app.use("/api/users", userRoutes);
app.use("/api/submissions",checkMaintenance, submissionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analysis", checkMaintenance,analysisRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/feedback",checkMaintenance, feedbackRoutes);
app.use("/api/classes",checkMaintenance, classRoutes );
app.use('/api/progress',checkMaintenance, progressRoutes);

// Global error handler — bắt mọi lỗi throw từ controller/service
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

    // Lỗi Multer (upload file)
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File quá lớn! Tối đa chỉ 2MB." });
    }
    if (err.name === "MulterError") {
        return res.status(400).json({ success: false, message: err.message });
    }

    // Lỗi JWT
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Token không hợp lệ" });
    }

    // Lỗi SQL Server
    if (err.code && err.code.startsWith("EREQUEST")) {
        return res.status(400).json({ success: false, message: "Lỗi truy vấn cơ sở dữ liệu" });
    }

    // Mặc định
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Lỗi hệ thống, vui lòng thử lại sau"
    });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});