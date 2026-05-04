
const { sql, poolPromise } = require("../config/db");

const getSetting = async (key) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("key", sql.VarChar, key)
        .query("SELECT SettingValue FROM SystemSettings WHERE SettingKey = @key");
    return result.recordset[0]?.SettingValue;
};

const updateSetting = async (key, value) => {
    const pool = await poolPromise;
    await pool.request()
        .input("key", sql.VarChar, key)
        .input("value", sql.NVarChar, value)
        .query("UPDATE SystemSettings SET SettingValue = @value, UpdatedAt = GETDATE() WHERE SettingKey = @key");
};

module.exports = { getSetting, updateSetting };