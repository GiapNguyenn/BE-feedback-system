const crypto = require("crypto");

/**
 * Tạo mã số ngẫu nhiên 6 chữ số
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Băm mã OTP bằng SHA-256 để bảo mật tuyệt đối trong Database
 */
const hashOTP = (otp) => {
    return crypto.createHash("sha256").update(otp).digest("hex");
};

module.exports = { generateOTP, hashOTP };