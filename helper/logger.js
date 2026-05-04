const { sql, poolPromise } = require("../config/db");

const saveLog = async (data) => {
    try {
        const { userId, level, action, description, ipAddress, metadata } = data;
        const pool = await poolPromise;
        
        // Tạo request mới
        const request = pool.request();

        request.input("userId", sql.Int, userId || null);
        request.input("level", sql.VarChar(20), level || 'INFO');
        request.input("action", sql.NVarChar(100), action);
        request.input("description", sql.NVarChar(sql.MAX), description || "");
        request.input("ipAddress", sql.VarChar(50), ipAddress || "");
        request.input("metadata", sql.NVarChar(sql.MAX), metadata ? JSON.stringify(metadata) : null);

        const result = await request.query(`
            INSERT INTO SystemLogs (userId, level, action, description, ipAddress, metadata, createdAt)
            VALUES (@userId, @level, @action, @description, @ipAddress, @metadata, GETDATE())
        `);

        console.log("ĐÃ GHI VÀO SQL THÀNH CÔNG!");
    } catch (err) {
        console.log("LỖI SQL RỒI:");
        console.error(err.message);
    }
};

module.exports = { saveLog };