const jwt = require("jsonwebtoken");

// 💡 Sửa lại dòng này để lấy đúng từ .env
const SECRET_KEY = process.env.JWT_SECRET; 

// tạo token
function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            roleId: user.roleId,
            studentCode: user.studentCode
        },
        SECRET_KEY, 
        { expiresIn: "1d" } 
    );
}

// verify token
function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        console.error("Lỗi Verify Token:", error.message);
        return null; 
    }
}

module.exports = { generateToken, verifyToken };