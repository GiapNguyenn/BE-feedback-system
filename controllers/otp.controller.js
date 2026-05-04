const otpService = require("../services/otp.service");

exports.requestOTP = async (req, res) => {
    try {
        // Nhận thêm currentPassword từ Frontend
        const { type, newEmail, currentPassword } = req.body;
        
        if (!['CHANGE_PASSWORD', 'CHANGE_EMAIL'].includes(type)) {
            return res.status(400).json({ message: "Invalid type" });
        }

        const result = await otpService.requestOTPService({
            userId: req.user.id,
            email: req.user.email,
            type,
            newEmail,
            currentPassword 
        });

        res.json({ message: "OTP đã gửi", ...result });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { otp, newValue } = req.body;
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;


        const result = await otpService.verifyOTPService({
            userId: req.user.id,
            otp,
            newValue,
            ipAddress
        });

        res.json({ message: "Cập nhật thành công", ...result });

    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};