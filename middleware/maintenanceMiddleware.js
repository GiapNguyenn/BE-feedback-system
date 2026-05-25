// middleware/maintenanceMiddleware.js
const settingModel = require("../models/setting.model");

const checkMaintenance = async (req, res, next) => {
    try {
        const mode = await settingModel.getSetting('MAINTENANCE_MODE');
        
        const isMaintenance = String(mode).toLowerCase().trim() === 'true';

        if (isMaintenance) {
            if (req.user && String(req.user.role).toLowerCase() === 'admin') {
                return next();
            }
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