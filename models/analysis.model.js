const { poolPromise, sql } = require("../config/db");
const { get } = require("../routes/Feedback.route");

const getAnalysisHistory = async (submissionId) => {
    const pool = await poolPromise; 
    const result = await pool.request()
        .input("submissionId", sql.Int, submissionId)
        .query(`
                SELECT TOP 1 
                    h.id AS analysisId, 
                    h.createdAt, 
                    s.FileName,
                    (
                        SELECT LineNumber, Message, Suggestion 
                        FROM DetectedErrors 
                        WHERE analysisId = h.id 
                        FOR JSON PATH
                    ) AS issuesJSON
                FROM AnalysisHistory h
                JOIN Submissions s ON h.submissionId = s.id
                WHERE h.submissionId = @submissionId
                ORDER BY h.createdAt DESC 
            `);

    return result.recordset.length > 0 ? result.recordset[0] : null;
}
const getContextByAnalysisId = async (analysisId) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input("analysisId", sql.Int, Number(analysisId))
        .query(`
            SELECT s.FileName, s.Language, s.Code
            FROM AnalysisHistory ah
            JOIN Submissions s ON ah.submissionId = s.Id
            WHERE ah.id = @analysisId
        `);

    return result.recordset[0] || null;
};
const saveMessage = async (analysisId, userId, role, message) => {
    const pool = await poolPromise;

    await pool.request()
        .input("analysisId", sql.Int, analysisId)
        .input("userId", sql.Int, userId)
        .input("role", sql.NVarChar, role)
        .input("message", sql.NVarChar(sql.MAX), message)
        .query(`
            INSERT INTO AnalysisChats (analysisId, userId, role, message)
            VALUES (@analysisId, @userId, @role, @message)
        `);
};
const getChatHistory = async (analysisId) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input("analysisId", sql.Int, analysisId)
        .query(`
            SELECT TOP 10 role, message
            FROM AnalysisChats
            WHERE analysisId = @analysisId
            ORDER BY createdAt ASC
        `);

    return result.recordset;
};

const getAnalysisChat = async (analysisId, userId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("analysisId", sql.Int, analysisId)
        .input("userId", sql.Int, userId)
        .query(`
        SELECT role, message, createdAt
        FROM AnalysisChats
        WHERE analysisId = @analysisId AND userId = @userId
        ORDER BY CreatedAt ASC  
        `);
        return result.recordset;
}
module.exports = {
    getAnalysisHistory,
    getContextByAnalysisId,
    saveMessage,
    getChatHistory,
    getAnalysisChat
}
