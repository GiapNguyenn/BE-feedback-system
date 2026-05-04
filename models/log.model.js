const { sql, poolPromise } = require("../config/db");

const getLogs = async (limit, skip, filter) => {
    const pool = await poolPromise;
    const request = pool.request();

    // Nạp các tham số lọc từ helper vào request
    filter.params.forEach(param => {
        request.input(param.name, sql.VarChar, param.value);
    });

    request.input("limit", sql.Int, parseInt(limit) || 20);
    request.input("skip", sql.Int, parseInt(skip) || 0);

    const query = `
        SELECT L.*, U.fullName as userName 
        FROM SystemLogs L
        LEFT JOIN Users U ON L.userId = U.id
        ${filter.whereClause}
        ORDER BY L.createdAt DESC
        OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const result = await request.query(query);
    return result.recordset;
};

const countLogs = async (filter) => {
    const pool = await poolPromise;
    const request = pool.request();

    filter.params.forEach(param => {
        request.input(param.name, sql.VarChar, param.value);
    });

    const result = await request.query(`SELECT COUNT(*) as total FROM SystemLogs L ${filter.whereClause}`);
    return result.recordset[0].total;
};

module.exports = { getLogs, countLogs };