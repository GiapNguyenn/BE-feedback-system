const { sql, poolPromise } = require("../config/db");

// 1. Lấy danh sách cảnh báo (Xử lý kết quả từ Store Procedure)
exports.getRiskAssessment = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input("TeacherId", sql.Int, teacherId)
            .execute("sp_GetStudentRiskAssessment");

        // 💡 Logic: Vì SP trả về tất cả lịch sử, ta lọc lấy bản ghi MỚI NHẤT của mỗi SV
        res.json({
        success: true,
        data: result.recordset
        });

        res.json({ 
            success: true, 
            data: Object.values(studentMap) 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. Lấy lịch sử lỗi của 1 SV để vẽ biểu đồ đường
exports.getStudentHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = await poolPromise;

        // BƯỚC 1: Lấy danh sách bài nộp của SV (Gọn hơn vì bỏ phần ClassAvg)
        const q1 = await pool.request().input("u", sql.Int, userId).query(`
            SELECT s.FileName, s.CreatedAt, CONVERT(DATE, s.CreatedAt) as Day,
            (SELECT COUNT(*) FROM DetectedErrors WHERE analysisId = (SELECT MAX(id) FROM AnalysisHistory WHERE submissionId = s.Id)) as MyErrors
            FROM Submissions s WHERE s.UserId = @u ORDER BY s.CreatedAt ASC
        `);

        // BƯỚC 2: Thống kê trung bình cả lớp theo ngày (Chỉ tính 1 lần cho cả ngày)
        const q2 = await pool.request().input("u", sql.Int, userId).query(`
            SELECT CONVERT(DATE, s2.CreatedAt) as Day, AVG(CAST(D.Cnt AS FLOAT)) as Avg
            FROM Submissions s2
            JOIN Users u2 ON s2.UserId = u2.id
            CROSS APPLY (
                SELECT COUNT(de.Id) as Cnt FROM AnalysisHistory ah
                LEFT JOIN DetectedErrors de ON ah.id = de.analysisId
                WHERE ah.submissionId = s2.Id AND ah.id = (SELECT MAX(id) FROM AnalysisHistory WHERE submissionId = s2.Id)
            ) as D
            WHERE u2.classId = (SELECT classId FROM Users WHERE id = @u)
            GROUP BY CONVERT(DATE, s2.CreatedAt)
        `);

        // BƯỚC 3: Ghép dữ liệu (Sử dụng Map để code ngắn hơn find)
        const statsMap = Object.fromEntries(q2.recordset.map(r => [r.Day.toISOString().split('T')[0], r.Avg]));
        
        const finalData = q1.recordset.map(sub => ({
            FileName: sub.FileName,
            CreatedAt: sub.CreatedAt,
            ErrorCount: sub.MyErrors,
            ClassAvg: statsMap[sub.Day.toISOString().split('T')[0]] || 0
        }));

        res.json({ success: true, data: finalData });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false });
    }
};
// 3. Gửi thông báo nhắc nhở hàng loạt (Bulk Insert)
exports.sendBulkReminders = async (req, res) => {
    const { userIds, message } = req.body;
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);
            for (const id of userIds) {
                await request
                    .input(`UID_${id}`, sql.Int, id)
                    .input(`MSG_${id}`, sql.NVarChar, message)
                    .query(`
                        INSERT INTO Notifications (UserId, Title, Message, IsRead, CreatedAt)
                        VALUES (@UID_${id}, N'Nhắc nhở học tập', @MSG_${id}, 0, GETDATE())
                    `);
            }
            await transaction.commit();
            res.json({ success: true, message: "Đã gửi thông báo cho nhóm sinh viên!" });
        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};