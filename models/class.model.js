const { sql, poolPromise } = require("../config/db");
const { generateToken } = require("../helper/jwt");
const jwt = require("jsonwebtoken");
const xlsx = require("xlsx");
const bcrypt = require("bcrypt");
const paginationHelper = require("../helper/paginationHelper");


const createClass = async (className, teacherId) => {
  const pool = await poolPromise;
  try {
    // check 
    const check = await pool.request()
      .input("name", sql.NVarChar, className)
      .input("tId", sql.Int, teacherId)
      .query(`
        SELECT * FROM Classes 
        WHERE className = @name AND teacherId = @tId
      `);
    if (check.recordset.length > 0) {
      throw new Error("Tên lớp đã tồn tại");
    }
    const result = await pool.request()
      .input("name", sql.NVarChar, className)
      .input("tId", sql.Int, teacherId)
      .query(`
        INSERT INTO Classes (className, teacherId) 
        VALUES (@name, @tId)
      `);

    return result;

  } catch (error) {
    console.error("LỖI TẠI SERVICE:", error);
    throw error;
  }
};    
const getTeacherClasses = async (teacherId) => {
    const pool = await poolPromise;
    try {
    const result = await pool.request()
        .input("tId", sql.Int, teacherId)
        .query("SELECT id, className FROM Classes WHERE teacherId = @tId");
        return result.recordset;
    }
    
   catch (error) {
        console.error("LỖI TẠI SERVICE:", error);
        throw error; 
    }
};
const deleteClass = async (classId, teacherId) => {
  const pool = await poolPromise;
  try {
    //check quyền
    const check = await pool.request()
      .input("classId", sql.Int, classId)
      .input("tId", sql.Int, teacherId)
      .query(`
        SELECT * FROM Classes 
        WHERE id = @classId AND teacherId = @tId
      `);

    if (check.recordset.length === 0) {
      throw new Error("Không có quyền hoặc lớp không tồn tại");
    }

    // gỡ student khỏi lớp
    await pool.request()
      .input("classId", sql.Int, classId)
      .query(`
        UPDATE Users 
        SET classId = NULL 
        WHERE classId = @classId AND roleId = 2
      `);

    // xoá class
    await pool.request()
      .input("classId", sql.Int, classId)
      .query(`
        DELETE FROM Classes 
        WHERE id = @classId
      `);

    return true;

  } catch (error) {
    console.error("LỖI SERVICE:", error);
    throw error;
  }
};
const deleteMultipleClasses = async (classIds, teacherId) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin(); // Dùng Transaction để nếu lỗi 1 lớp thì sẽ không xoá bất kỳ lớp nào

    for (const classId of classIds) {
      // 1. Kiểm tra quyền cho từng lớp
      const check = await transaction.request()
        .input("classId", sql.Int, classId)
        .input("tId", sql.Int, teacherId)
        .query(`SELECT id FROM Classes WHERE id = @classId AND teacherId = @tId`);

      if (check.recordset.length > 0) {
        // 2. Gỡ sinh viên khỏi lớp (roleId = 2)
        await transaction.request()
          .input("classId", sql.Int, classId)
          .query(`UPDATE Users SET classId = NULL WHERE classId = @classId AND roleId = 2`);

        // 3. Xoá lớp
        await transaction.request()
          .input("classId", sql.Int, classId)
          .query(`DELETE FROM Classes WHERE id = @classId`);
      }
    }

    await transaction.commit(); // Hoàn tất xoá
    return true;

  } catch (error) {
    await transaction.rollback(); // Lỗi thì quay lại trạng thái cũ
    console.error("LỖI SERVICE XOÁ NHIỀU:", error);
    throw error;
  }
};

module.exports = {
    getTeacherClasses,
    createClass,
    deleteClass,
    deleteMultipleClasses
}