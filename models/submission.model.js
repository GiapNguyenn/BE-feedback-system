const submissionModel = require("./submission.model");
const { sql, poolPromise } = require("../config/db");
const model = require("../config/gemini");

// Lấy submission
const getSubmission = async (submissionId) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("Id", sql.Int, submissionId)
    .query("SELECT Code, Language FROM Submissions WHERE Id = @Id");

  return result.recordset[0];
};
// Tạo analysis
const createAnalysis = async (submissionId) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("submissionId", sql.Int, submissionId)
    .query(`
      INSERT INTO AnalysisHistory (submissionId, CreatedAt)
      OUTPUT INSERTED.id
      VALUES (@submissionId, GETDATE())
    `);

  return result.recordset[0].id;
};
// Lấy danh mục lỗi 
const getErrorCategories = async (language) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("Language", sql.NVarChar, language)
    .execute("sp_GetErrorPatternsByLanguage");

  if (result.recordset.length === 0) {
    return "- Lỗi logic\n- Lỗi cú pháp\n- Clean code";
  }

  return result.recordset.map(e => `- ${e.errorCategory}`).join("\n");
};
// Lưu lỗi
const saveErrorsWithTransaction = async (submissionId, analysisId, errors) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    for (let issue of errors) {
      await new sql.Request(transaction)
        .input("SubmissionId", sql.Int, submissionId)
        .input("AnalysisId", sql.Int, analysisId)
        .input("LineNumber", sql.Int, issue.line || 0)
        .input("Message", sql.NVarChar(sql.MAX), issue.error)
        .input("Suggestion", sql.NVarChar(sql.MAX), issue.fix)
        .execute("sp_InsertDetectedError");
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
const updateSubmissionStatus = async (submissionId) => {
  const pool = await poolPromise;

  await pool.request()
    .input("subId", sql.Int, submissionId)
    .query("UPDATE Submissions SET Status = 'done' WHERE Id = @subId");
};
const checkDuplicate = async (fileName, userId) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input("FileName", sql.NVarChar, fileName)
        .input("UserId", sql.Int, userId)
        .query(`
            SELECT Id 
            FROM Submissions 
            WHERE FileName = @FileName AND UserId = @UserId
        `);

    return result.recordset.length > 0;
};
const insertSubmission = async ({ fileName, filePath, code, language, userId }) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input("FileName", sql.NVarChar, fileName)
        .input("FilePath", sql.NVarChar, filePath)
        .input("Code", sql.NVarChar(sql.MAX), code)
        .input("Language", sql.NVarChar, language)
        .input("UserId", sql.Int, userId)
        .query(`
            INSERT INTO Submissions (FileName, FilePath, Code, Language, Status, UserId, CreatedAt)
            OUTPUT INSERTED.Id
            VALUES (@FileName, @FilePath, @Code, @Language, 'done', @UserId, GETDATE())
        `);

    return result.recordset[0].Id;
};
const getStudentSubmissions = async (userId) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input("UserId", sql.Int, userId)
        .query(`
            SELECT 
                s.Id as id,
                s.FileName,
                s.Code,
                s.Language,
                s.Status,
                s.CreatedAt,
                s.IsPinned, 
                -- Lấy ID phân tích mới nhất
                (SELECT TOP 1 id FROM AnalysisHistory 
                 WHERE submissionId = s.Id 
                 ORDER BY CreatedAt DESC) as analysisId,
                -- Lấy thêm thông tin nhận xét từ Giảng viên
                tf.WeaknessAnalysis,
                tf.Strengths,
                tf.TeacherComment,
                tf.Status as FeedbackStatus
            FROM Submissions s
            LEFT JOIN TeacherFeedbacks tf ON s.Id = tf.SubmissionId
            WHERE s.UserId = @UserId
            ORDER BY s.IsPinned DESC, s.CreatedAt DESC
        `);

    return result.recordset;
};
const togglePin = async (id) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            UPDATE Submissions
            SET IsPinned = CASE WHEN IsPinned = 1 THEN 0 ELSE 1 END
            OUTPUT INSERTED.IsPinned
            WHERE Id = @id
        `);

    return result.recordset[0]; // trả về trạng thái mới
};
const deleteSubmission = async (id, userId) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const request = new sql.Request(transaction);

        request.input("id", sql.Int, id);
        request.input("userId", sql.Int, userId);

        // kiểm tra quyền + tồn tại
        const check = await request.query(`
            SELECT Id FROM Submissions 
            WHERE Id = @id AND UserId = @userId
        `);

        if (check.recordset.length === 0) {
            await transaction.rollback();
            return null;
        }

        // 1. Xoá chat
        await request.query(`
            DELETE FROM AnalysisChats 
            WHERE analysisId IN (
                SELECT id FROM AnalysisHistory WHERE submissionId = @id
            )
        `);

        // 2. Xoá lỗi
        await request.query(`
            DELETE FROM DetectedErrors 
            WHERE SubmissionId = @id
        `);

        // 3. Xoá history
        await request.query(`
            DELETE FROM AnalysisHistory 
            WHERE submissionId = @id
        `);

        // 4. Xoá submission
        await request.query(`
            DELETE FROM Submissions 
            WHERE Id = @id
        `);

        await transaction.commit();

        return true;

    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

const getSubmissionById = async (id) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            SELECT 
                s.*, 
                tf.WeaknessAnalysis, 
                tf.Strengths, 
                tf.TeacherComment, 
                tf.Status as FeedbackStatus,
                -- Lấy thêm analysisId mới nhất để load lỗi AI
                (SELECT TOP 1 id FROM AnalysisHistory WHERE submissionId = s.Id ORDER BY CreatedAt DESC) as analysisId
            FROM Submissions s
            LEFT JOIN TeacherFeedbacks tf ON s.Id = tf.SubmissionId
            WHERE s.Id = @id
        `);
    return result.recordset[0] || null;
};

// Lấy tất cả
const getAllSubmissions = async () => {
    const pool = await poolPromise;

    const result = await pool.request()
        .query(`SELECT * FROM Submissions`);

    return result.recordset;
};


module.exports = { 
    getSubmission,
    createAnalysis,
    getErrorCategories,
    saveErrorsWithTransaction,
    updateSubmissionStatus,
    checkDuplicate,
    insertSubmission,
    getStudentSubmissions,
    togglePin,
    deleteSubmission,
    getSubmissionById,
    getAllSubmissions,
}