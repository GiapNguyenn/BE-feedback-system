const bcrypt = require("bcrypt");
const { poolPromise, sql } = require("../config/db");
const otpModel = require("../models/otp.model");
const { generateOTP, hashOTP } = require("../helper/otpHelper");
const { sendOTPEmail } = require("../services/email.service");

const requestOTPService = async ({ userId, email, type, newEmail, currentPassword }) => {
    // Đảm bảo lấy pool thành công
    const pool = await poolPromise;
 
    // Kiểm tra an toàn: Nếu pool không có hàm request, nghĩa là config db đang lỗi
    if (!pool || typeof pool.request !== 'function') {
        throw new Error("Database connection pool is not initialized correctly");
    }

    // --- KIỂM TRA PASSWORD CŨ ---
    const userResult = await pool.request()
        .input("uid", sql.Int, userId)
        .query("SELECT password FROM Users WHERE id = @uid");

    if (userResult.recordset.length === 0) {
        throw { status: 404, message: "Người dùng không tồn tại" };
    }

    const isMatch = await bcrypt.compare(currentPassword, userResult.recordset[0].password);
    if (!isMatch) {
        throw { status: 401, message: "Mật khẩu hiện tại không chính xác" };
    }

    // 1. Check spam
    const recent = await otpModel.findRecentOTP(userId);
    if (recent.recordset.length > 0) {
        const lastTime = new Date(recent.recordset[0].createdAt);
        if (Date.now() - lastTime.getTime() < 30000) {
            throw { status: 429, message: "Vui lòng chờ 30 giây" };
        }
    }

    // 2. Logic OTP
    const otp = generateOTP();
    const hash = hashOTP(otp);
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000);

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        await otpModel.deleteOldOTP(transaction, userId);
        await otpModel.insertOTP(transaction, {
            userId, hash, type, newEmail: newEmail || null, expiredAt
        });

        await transaction.commit();

        const targetEmail = type === "CHANGE_EMAIL" ? newEmail : email;


        if (!targetEmail) {
            throw { status: 400, message: "Không tìm thấy địa chỉ email người nhận" };
        }
        await sendOTPEmail(targetEmail, otp);

        return { success: true };
    } catch (err) {
        await transaction.rollback();
        console.error("LỖI TẠI SERVICE REQUEST:", err); // Đã sửa từ error thành err
        throw err;
    }
};

const verifyOTPService = async ({ userId, otp, newValue ,ipAddress }) => {
    const pool = await poolPromise;
    const result = await otpModel.findLatestOTP(userId);

    if (result.recordset.length === 0) {
        throw { status: 400, message: "Không tìm thấy OTP" };
    }

    const record = result.recordset[0];
    if (new Date(record.expiredAt) < new Date()) {
        throw { status: 400, message: "OTP hết hạn" };
    }

    if (record.attemptCount >= 5) {
        throw { status: 429, message: "Sai quá 5 lần" };
    }

    const hash = hashOTP(otp);
    if (hash !== record.otpHash) {
        await otpModel.increaseAttempt(record.id);
        throw { status: 400, message: "OTP sai" };
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        const request = new sql.Request(transaction);
        await otpModel.markUsed(transaction, record.id);

        if (record.type === "CHANGE_PASSWORD") {
            const hashedPass = await bcrypt.hash(newValue, 10);
            await request
                .input("uid", sql.Int, userId)
                .input("pass", sql.VarChar, hashedPass)
                .query("UPDATE Users SET password = @pass WHERE id = @uid");
        }

        if (record.type === "CHANGE_EMAIL") {
            await request
                .input("uid", sql.Int, userId)
                .input("email", sql.VarChar, record.newEmail)
                .query("UPDATE Users SET email = @email WHERE id = @uid");
        }

        await transaction.commit();
        try {
            const helperSaveLog = require("../helper/logger"); 
            const userEmail = record.email || "Ẩn danh"; 
            const actionType = record.type === "CHANGE_PASSWORD" ? "Mật khẩu" : "Email";
            await helperSaveLog.saveLog({
                    userId: userId, 
                    level: 'WARNING',
                    action: `Cập nhật ${actionType}`,
                    description: `Người dùng có Email: ${userEmail} đã xác thực OTP thành công và cập nhật ${actionType}`,
                    ipAddress: ipAddress 
                });
            } catch (e) {
                console.log("Lỗi ghi log:", e.message);
            }
        return { success: true };
    } catch (err) {
        await transaction.rollback();
        console.error("LỖI TẠI SERVICE VERIFY:", err); // Đã sửa từ error thành err
        throw err;
    }
};

module.exports = { requestOTPService, verifyOTPService };