const { sql, poolPromise } = require("../config/db");
const { generateToken } = require("../helper/jwt");
const jwt = require("jsonwebtoken");
const xlsx = require("xlsx");
const bcrypt = require("bcrypt");
const paginationHelper = require("../helper/paginationHelper");
const model = require("../config/gemini");



const register = async (username, email, password, studentCode, fullName, roleId) => {
    const pool = await poolPromise;
    const check = await pool.request()
    .input("email", sql.NVarChar, email)
    .query("SELECT * FROM Users WHERE email = @email");

    if (check.recordset.length > 0) {
        throw new Error("Email đã tồn tại");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await pool.request()
      .input("username", sql.NVarChar, username)
      .input("studentCode", sql.NVarChar, studentCode)
      .input("email", sql.NVarChar, email)
      .input("fullName", sql.NVarChar, fullName)
      .input("password", sql.NVarChar, hashedPassword)
      .input("roleId", sql.Int, roleId)
      .execute("sp_registerUser");

};
const adminRegisterTeacher = async (studentCode, email, fullName, password) => {
    const pool = await poolPromise;
    
    const check = await pool.request()
    .input("email", sql.NVarChar, email)
    .query("SELECT * FROM Users WHERE email = @email");
    if (check.recordset.length > 0) {
        throw new Error("Email đã tồn tại");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.request()
      .input("studentCode", sql.NVarChar, studentCode)
      .input("email", sql.NVarChar, email)
      .input("fullName", sql.NVarChar, fullName)
      .input("password", sql.NVarChar, hashedPassword)
      .input("roleId", sql.Int, 3) 
      .execute("sp_registerUser"); 
};
const teacherCreateStudent = async (studentCode, email, fullName, password, classId) => {
  const pool = await poolPromise;
try {
  // check email
  const checkEmail = await pool.request()
    .input("email", sql.NVarChar, email)
    .query("SELECT * FROM Users WHERE email = @email");
  if (checkEmail.recordset.length > 0) {
    throw new Error("Email đã tồn tại");
    }
  // check studentCode
  const checkCode = await pool.request()
    .input("studentCode", sql.NVarChar, studentCode)
    .query("SELECT * FROM Users WHERE studentCode = @studentCode");

  if (checkCode.recordset.length > 0) {
    throw new Error("Mã sinh viên đã tồn tại");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.request()
    .input("studentCode", sql.NVarChar, studentCode)
    .input("email", sql.NVarChar, email)
    .input("fullName", sql.NVarChar, fullName)
    .input("password", sql.NVarChar, hashedPassword)
    .input("roleId", sql.Int, 2)
    .input("classId", sql.Int, classId)
    .execute("sp_registerUser");
  } catch (error) {
        console.error("LỖI TẠI SERVICE:", error);
        throw error; 
    }
};
const getStudentsInClass = async (classId, teacherId, searchTerm, pagination) => {
  const pool = await poolPromise;

  // COUNT
  const countResult = await pool.request()
    .input("classId", sql.Int, classId)
    .input("tId", sql.Int, teacherId)
    .input("search", sql.NVarChar, `%${searchTerm}%`)
    .query(`
      SELECT COUNT(*) AS total 
      FROM Users u
      JOIN Classes c ON u.classId = c.id
      WHERE u.classId = @classId 
        AND c.teacherId = @tId
        AND (u.studentCode LIKE @search OR u.fullName LIKE @search)
    `);

  const total = countResult.recordset[0].total;

  // DATA
  const result = await pool.request()
    .input("classId", sql.Int, classId)
    .input("tId", sql.Int, teacherId)
    .input("search", sql.NVarChar, `%${searchTerm}%`)
    .query(`
      SELECT u.id, u.studentCode, u.fullName, u.email, u.createdAt 
      FROM Users u
      JOIN Classes c ON u.classId = c.id
      WHERE u.classId = @classId 
        AND c.teacherId = @tId
        AND (u.studentCode LIKE @search OR u.fullName LIKE @search)
      ORDER BY u.id 
      OFFSET ${pagination.skip} ROWS 
      FETCH NEXT ${pagination.limitItems} ROWS ONLY
    `);

  return {
    total,
    students: result.recordset
  };
};
const getStudentsByTeacher = async (teacherId) => {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("tId", sql.Int, teacherId)
      .query(`
        SELECT u.id, u.studentCode, u.fullName, u.email, c.className 
        FROM Users u
        JOIN Classes c ON u.classId = c.id
        WHERE c.teacherId = @tId AND u.roleId = 2
      `);
    return result.recordset;
};
const login = async (email, password) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("email", sql.NVarChar, email)
        .execute("sp_loginUser");
        
    if (result.recordset.length === 0) {
        throw new Error("Email không tồn tại");
    }
    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {throw new Error("Mật khẩu không chính xác")}
    return user;

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
const updateUser = async ({ studentCode, email, fullName, password, roleId }) => {
  try {
    let newPassword = password;

    if (password) {
      newPassword = await bcrypt.hash(password, 10);
    }

    const pool = await poolPromise;

    await pool.request()
      .input("studentCode", sql.NVarChar, studentCode)
      .input("email", sql.NVarChar, email)
      .input("fullName", sql.NVarChar, fullName)
      .input("password", sql.NVarChar, newPassword)
      .input("roleId", sql.Int, roleId)
      .execute("sp_updateUser");

    return {
      success: true,
      message: "Cập nhật user thành công"
    };

  } catch (err) {
    throw err;
  }
};
const getUsers = async () => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .execute("sp_getAllUser");

    return result.recordset;

  } catch (err) {
    throw err;
  }
};
const getUserByStudentCode = async (studentCode) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("studentCode", sql.NVarChar, studentCode)
      .execute("sp_GetUserByStudentCode");

    return result.recordset;

  } catch (err) {
    throw err;
  }
}; 
const findUser = async (studentCode, email, transaction) => {
    const request = new sql.Request(transaction);

    const result = await request
        .input("studentCode", sql.NVarChar, studentCode)
        .input("email", sql.NVarChar, email)
        .query(`
            SELECT * FROM Users
            WHERE studentCode = @studentCode AND email = @email
        `);

    return result.recordset;
};

const updateClass = async (studentCode, email, classId, transaction) => {
    const request = new sql.Request(transaction);

    await request
        .input("studentCode", sql.NVarChar, studentCode)
        .input("email", sql.NVarChar, email)
        .input("classId", sql.Int, classId)
        .query(`
            UPDATE Users
            SET classId = @classId
            WHERE studentCode = @studentCode AND email = @email
        `);
};

const insertUser = async (user, transaction) => {
    const request = new sql.Request(transaction);

    await request
        .input("studentCode", sql.NVarChar, user.studentCode)
        .input("email", sql.NVarChar, user.email)
        .input("fullName", sql.NVarChar, user.fullName)
        .input("password", sql.NVarChar, user.password)
        .input("roleId", sql.Int, user.roleId)
        .input("classId", sql.Int, user.classId)
        .execute("sp_registerUser");
};
const findByEmail = async (email) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("email", sql.VarChar, email)
        .query("SELECT * FROM Users WHERE email = @email");
    return result.recordset[0]; // Trả về user đầu tiên tìm thấy hoặc undefined
};

module.exports = {
    register,
    adminRegisterTeacher,
    teacherCreateStudent,
    getStudentsInClass,
    getStudentsByTeacher,
    login,
    getTeacherClasses,
    updateUser,
    getUsers,
    getUserByStudentCode,
    findUser,
    updateClass,
    insertUser,
    findByEmail

}
