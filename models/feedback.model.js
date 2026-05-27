const { poolPromise, sql } = require("../config/db");
const paginationHelper = require('../helper/paginationHelper');


const getExistingDraft = async (submissionId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("sId", sql.Int, Number(submissionId))
        .query(`
            SELECT AIDraft 
            FROM TeacherFeedbacks 
            WHERE SubmissionId = @sId
        `);
        

    return result.recordset;
};

const getErrorMessages = async (submissionId) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input("sId", sql.Int, submissionId)
        .query(`
            SELECT Message 
            FROM DetectedErrors 
            WHERE SubmissionId = @sId
        `);

    return result.recordset;
};

const upsertFeedback = async (submissionId, teacherId , cleanJson , parsed) => {
    const pool = await poolPromise;
    await pool.request()
        .input("sId", sql.Int, submissionId)
        .input("tId", sql.Int, teacherId)
        .input("aiDraft", sql.NVarChar, cleanJson)
        .input("w", sql.NVarChar, parsed.weakness)
        .input("s", sql.NVarChar, parsed.strengths)
        .input("c", sql.NVarChar, parsed.comment)
        .query(`
            MERGE TeacherFeedbacks AS target
            USING (SELECT @sId AS SubmissionId) AS source
            ON target.SubmissionId = source.SubmissionId
            WHEN MATCHED THEN
                UPDATE SET 
                    AIDraft = @aiDraft,
                    WeaknessAnalysis = @w,
                    Strengths = @s,
                    TeacherComment = @c,
                    UpdatedAt = GETDATE()
            WHEN NOT MATCHED THEN
                INSERT (SubmissionId, TeacherId, AIDraft, WeaknessAnalysis, Strengths, TeacherComment, Status)
                VALUES (@sId, @tId, @aiDraft, @w, @s, @c, 'Draft');
        `);
}

const saveOficialFeedback = async (submissionId, teacherId, weakness, strengths, comment) => {
    const pool = await poolPromise;
    
    // 1. Cập nhật hoặc Chèn vào bảng TeacherFeedbacks
    const result = await pool.request()
        .input("sId", sql.Int, submissionId)
        .input("tId", sql.Int, teacherId)
        .input("w", sql.NVarChar, weakness)
        .input("s", sql.NVarChar, strengths)
        .input("c", sql.NVarChar, comment)
        .query(`
            UPDATE TeacherFeedbacks
            SET WeaknessAnalysis = @w, Strengths = @s, TeacherComment = @c,
                Status = 'Approved', UpdatedAt = GETDATE()
            WHERE SubmissionId = @sId;
            SELECT @@ROWCOUNT AS affected;
        `);

    if (result.recordset[0].affected === 0) {
        await pool.request()
            .input("sId", sql.Int, submissionId)
            .input("tId", sql.Int, teacherId)
            .input("w", sql.NVarChar, weakness)
            .input("s", sql.NVarChar, strengths)
            .input("c", sql.NVarChar, comment)
            .query(`
                INSERT INTO TeacherFeedbacks (SubmissionId, TeacherId, WeaknessAnalysis, Strengths, TeacherComment, Status)
                VALUES (@sId, @tId, @w, @s, @c, 'Approved')
            `);
    }

    // 2. TẠO THÔNG BÁO CHO SINH VIÊN
    await pool.request()
        .input("sId", sql.Int, submissionId)
        .query(`
            INSERT INTO Notifications (UserId, Title, Message, Type, IsRead, CreatedAt, SubmissionId)
            SELECT 
                UserId, 
                N'Bài tập đã được chấm', 
                N'Giảng viên đã gửi nhận xét cho bài: ' + FileName, 
                'FEEDBACK', 
                0, 
                GETDATE(),
                Id
            FROM Submissions WHERE Id = @sId
        `);

    return true;
};


const getAllSubmissionsForAdmin = async (teacherId, classId, page = 1, limitItems = 10) => {
    const pool = await poolPromise;

    // 1. Đếm tổng để tính phân trang
    let countQuery = `
        SELECT COUNT(*) as total
        FROM Submissions s
        JOIN Users u ON s.UserId = u.Id
        JOIN Classes c ON u.classId = c.id
        LEFT JOIN TeacherFeedbacks tf ON tf.SubmissionId = s.Id
        WHERE c.TeacherId = @tId
    `;
    if (classId) countQuery += ` AND u.classId = @classId`;

    const countRequest = pool.request().input("tId", sql.Int, teacherId);
    if (classId) countRequest.input("classId", sql.Int, classId);
    const countResult = await countRequest.query(countQuery);
    const totalCount = countResult.recordset[0].total;

    // 2. Tính phân trang bằng helper
    let objectPagination = { currentPage: 1, limitItems, skip: 0, totalPage: 1 };
    objectPagination = paginationHelper(objectPagination, { page }, totalCount);

    // 3. Query chính có OFFSET
    let query = `
        SELECT 
            s.Id as id, 
            u.studentCode, 
            u.fullName as studentName, 
            c.className,
            s.FileName as assignmentTitle, 
            s.Language as language,
            CASE 
                WHEN tf.Id IS NOT NULL THEN N'Đã nhận xét' 
                ELSE N'Chờ nhận xét' 
            END AS status,
            (
                SELECT COUNT(*) 
                FROM DetectedErrors de 
                JOIN AnalysisHistory ah ON de.analysisId = ah.Id 
                WHERE ah.submissionId = s.Id
            ) as errorCount
        FROM Submissions s
        JOIN Users u ON s.UserId = u.Id
        JOIN Classes c ON u.classId = c.id
        LEFT JOIN TeacherFeedbacks tf ON tf.SubmissionId = s.Id
        WHERE c.TeacherId = @tId
    `;
    if (classId) query += ` AND u.classId = @classId`;
    query += ` ORDER BY s.CreatedAt DESC
               OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request()
        .input("tId", sql.Int, teacherId)
        .input("skip", sql.Int, objectPagination.skip)
        .input("limit", sql.Int, objectPagination.limitItems);
    if (classId) request.input("classId", sql.Int, classId);

    const result = await request.query(query);

    return {
        data: result.recordset,
        pagination: objectPagination
    };
};
const getAllClasses = async (teacherId) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input("tId", sql.Int, teacherId)
        .query(`SELECT id, className FROM Classes WHERE TeacherId = @tId`);

    return result.recordset;

}
const getStudentNotifications = async (userId) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("uId", sql.Int, userId)
            .query(`
                SELECT TOP 20
                    n.*,

                    tf.TeacherComment,
                    tf.Strengths,
                    tf.WeaknessAnalysis

                FROM Notifications n

                LEFT JOIN TeacherFeedbacks tf
                    ON n.SubmissionId = tf.SubmissionId

                WHERE n.UserId = @uId

                ORDER BY n.CreatedAt DESC
            `);

        return result.recordset;

    } catch (err) {
        console.error("Notification SQL Error:", err);
        throw err;
    }
};
const markNotificationAsRead = async (notiId) => {
    const pool = await poolPromise;
    await pool.request()
        .input("Id", sql.Int, notiId)
        .query("UPDATE Notifications SET IsRead = 1 WHERE Id = @Id");
    return true;
};

module.exports = {
    getExistingDraft,
    getErrorMessages,
    upsertFeedback,
    saveOficialFeedback,
    getAllSubmissionsForAdmin,
    getAllClasses,
    getStudentNotifications,
    markNotificationAsRead
    
};