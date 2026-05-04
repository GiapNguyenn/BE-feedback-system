const nodemailer = require('nodemailer');

// Cấu hình "người gửi" - Ở đây dùng Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
});

/**
 * Hàm gửi OTP
 * @param {string} toEmail - Email người nhận
 * @param {string} otp - Mã OTP 6 số
 */
const sendOTPEmail = async (toEmail, otp) => {
    try {
        const mailOptions = {
            from: '"Hệ thống Feedback" <no-reply@feedback.com>',
            to: toEmail,
            subject: 'Mã xác thực OTP (Hết hạn sau 5 phút)',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #6366f1; text-align: center;">Xác thực tài khoản</h2>
                    <p>Chào bạn, bạn đang thực hiện thay đổi thông tin cá nhân.</p>
                    <p>Mã OTP của bạn là:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #1e293b; letter-spacing: 5px; background: #f1f5f9; padding: 10px 20px; border-radius: 5px; border: 1px dashed #6366f1;">
                            ${otp}
                        </span>
                    </div>
                    <p style="color: #ef4444; font-size: 13px;">* Lưu ý: Mã này sẽ hết hạn sau 5 phút và chỉ sử dụng được 1 lần.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">Đây là email tự động, vui lòng không phản hồi.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        throw new Error("Không thể gửi email xác thực");
    }
};

module.exports = { sendOTPEmail };