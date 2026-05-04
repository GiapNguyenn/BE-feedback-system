const settingModel = require("../models/setting.model");

// Lấy trạng thái bảo trì
exports.getMaintenanceStatus = async (req, res) => {
    try {
        const value = await settingModel.getSetting('MAINTENANCE_MODE');
        res.json({ 
            success: true, 
            status: value === 'true' // Chuyển từ string 'true' sang kiểu boolean true
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Cập nhật trạng thái bảo trì
exports.updateMaintenanceStatus = async (req, res) => {
    try {
        const { status } = req.body; // Frontend gửi lên { status: true } hoặc { status: false }
        
        // Lưu vào DB dưới dạng chuỗi 'true'/'false'
        await settingModel.updateSetting('MAINTENANCE_MODE', status.toString());

        res.json({ 
            success: true, 
            message: `Hệ thống đã ${status ? 'BẬT' : 'TẮT'} bảo trì thành công!` 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};