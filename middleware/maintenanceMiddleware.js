// middleware/maintenanceMiddleware.js
const settingModel = require("../models/setting.model");

const checkMaintenance = async (req, res, next) => {
    try {
        const mode = await settingModel.getSetting('MAINTENANCE_MODE');
        
        // 1. Ép kiểu về string và trim để so sánh chính xác nhất
        const isMaintenance = String(mode).toLowerCase().trim() === 'true';

        if (isMaintenance) {
            // 2. LOG ĐỂ KIỂM TRA (Giáp xem ở console Node.js nhé)
            console.log("Hệ thống đang bảo trì. User Role:", req.user?.role);

            // 3. Quan trọng: Phải kiểm tra req.user (đã được authenticateToken giải mã)
            // Nếu là admin thì cho qua
            if (req.user && String(req.user.role).toLowerCase() === 'admin') {
                return next();
            }

            // 4. Nếu không phải Admin thì mới chặn
            return res.status(503).json({
                success: false,
                isMaintenance: true,
                message: "Hệ thống đang bảo trì để nâng cấp. Vui lòng quay lại sau!"
            });
        }
        
        next(); 
    } catch (error) {
        console.error("Lỗi Middleware Bảo trì:", error);
        next(); 
    }
};

module.exports = checkMaintenance;