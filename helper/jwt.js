const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET; 
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

// tạo token
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, roleId: user.roleId, studentCode: user.studentCode },
        SECRET_KEY,
        { expiresIn: "15m" }
    );
}
function generateRefreshToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, roleId: user.roleId, studentCode: user.studentCode },
        REFRESH_SECRET,
        { expiresIn: "7d" }
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
function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, REFRESH_SECRET);
    } catch (error) {
        return null;
    }
}

module.exports = { generateToken,generateRefreshToken, verifyToken , verifyRefreshToken  };