const { sql, poolPromise } = require('../config/db');

const getDashboardStats = async (userId, role, classId = null) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('UserId', sql.Int, userId)
        .input('Role', sql.NVarChar, role.toLowerCase())
        .input('ClassId', sql.Int, classId)
        .execute('sp_GetDashboardStats');
    return result;
};

module.exports = { getDashboardStats };