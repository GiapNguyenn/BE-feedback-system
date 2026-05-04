const { sql, poolPromise } = require("../config/db");

/**
 * GET ALL TEACHERS
 */
const getAllTeachers = async (skip, limit) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("skip", sql.Int, skip)
    .input("limit", sql.Int, limit)
    .query(`
      SELECT 
        u.id, u.fullName, u.email, u.createdAt,
        COUNT(c.id) as totalClasses,
        COUNT(*) OVER() as totalCount -- 💡 Lấy tổng số dòng để tính totalPage
      FROM Users u
      LEFT JOIN Classes c ON c.teacherId = u.id
      WHERE u.roleId = 3
      GROUP BY u.id, u.fullName, u.email, u.createdAt
      ORDER BY u.createdAt DESC
      OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY
    `);
  return result.recordset;
};
/**
 * CHECK EMAIL EXIST
 */
const findTeacherByEmail = async (email) => {

  const pool = await poolPromise;

  const result = await pool.request()
    .input("email", sql.VarChar, email)
    .query(`
      SELECT id
      FROM Users
      WHERE email = @email
    `);

  return result.recordset[0];
};

/**
 * CREATE TEACHER
 */
const createTeacher = async (
  fullName,
  email,
  hashedPassword
) => {

  const pool = await poolPromise;

  await pool.request()
    .input("fullName", sql.NVarChar, fullName)
    .input("email", sql.VarChar, email)
    .input("password", sql.VarChar, hashedPassword)
    .input("roleId", sql.Int, 2)
    .query(`
    
      INSERT INTO Users (
        fullName,
        email,
        password,
        roleId,
        createdAt
      )

      VALUES (
        @fullName,
        @email,
        @password,
        @roleId,
        GETDATE()
      )

    `);

  return true;
};

/**
 * DELETE TEACHER
 */
const deleteTeacher = async (teacherId) => {

  const pool = await poolPromise;

  /**
   * CHECK CLASS
   */
  const classCheck = await pool.request()
    .input("teacherId", sql.Int, teacherId)
    .query(`
      SELECT id
      FROM Classes
      WHERE teacherId = @teacherId
    `);

  if (classCheck.recordset.length > 0) {
    throw new Error("Giáo viên đang có lớp");
  }

  /**
   * DELETE
   */
  await pool.request()
    .input("id", sql.Int, teacherId)
    .query(`
      DELETE FROM Users
      WHERE id = @id
      AND roleId = 3
    `);

  return true;
};

module.exports = {
  getAllTeachers,
  findTeacherByEmail,
  createTeacher,
  deleteTeacher
};