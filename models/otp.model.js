const { poolPromise, sql } = require("../config/db");

const findLatestOTP = async (userId) => {
    const pool = await poolPromise;
    return pool.request()
        .input("uid", sql.Int, userId)
        .query(`
            SELECT TOP 1 * 
            FROM OTP_Verifications 
            WHERE userId = @uid AND isUsed = 0 
            ORDER BY createdAt DESC
        `);
};
const findRecentOTP = async (userId) => {
    const pool = await poolPromise;
    return pool.request()
        .input("uid", sql.Int, userId)
        .query(`
            SELECT TOP 1 createdAt 
            FROM OTP_Verifications 
            WHERE userId = @uid AND isUsed = 0 -- 👈 THÊM DÒNG NÀY
            ORDER BY createdAt DESC
        `);
};

const deleteOldOTP = async (transaction, userId) => {
    return new sql.Request(transaction)
        .input("uid", sql.Int, userId)
        .query("UPDATE OTP_Verifications SET isUsed = 1 WHERE userId = @uid AND isUsed = 0");
};
const insertOTP = async (transaction, data) => {
    const { userId, hash, type, newEmail, expiredAt } = data;

    return new sql.Request(transaction)
        .input("uid", sql.Int, userId)
        .input("hash", sql.VarChar, hash)
        .input("type", sql.VarChar, type)
        .input("newEmail", sql.VarChar, newEmail)
        .input("exp", sql.DateTime, expiredAt)
        .query(`
            INSERT INTO OTP_Verifications (userId, otpHash, type, newEmail, expiredAt)
            VALUES (@uid, @hash, @type, @newEmail, @exp)
        `);
};

const increaseAttempt = async (id) => {
    const pool = await poolPromise;
    return pool.request()
        .input("id", sql.Int, id)
        .query(`
            UPDATE OTP_Verifications 
            SET attemptCount = attemptCount + 1 
            WHERE id = @id
        `);
};
const markUsed = async (transaction, id) => {
    return new sql.Request(transaction)
        .input("id", sql.Int, id)
        .query("UPDATE OTP_Verifications SET isUsed = 1 WHERE id = @id");
};

module.exports = {
    findLatestOTP,
    findRecentOTP,
    deleteOldOTP,
    insertOTP,
    increaseAttempt,
    markUsed
};