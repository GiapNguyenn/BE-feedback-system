/**
 * @swagger
 * /api/submissions/{id}/analyze:
 *   post:
 *     summary: Phân tích bài nộp bằng AI
 *     description: Sử dụng AI (Gemini) để phân tích mã nguồn, phát hiện lỗi và lưu kết quả vào hệ thống
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của submission
 *         schema:
 *           type: integer
 *           example: 1
 *
 *     responses:
 *       200:
 *         description: Phân tích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 analysisId:
 *                   type: integer
 *                   example: 10
 *                 errors:
 *                   type: array
 *                   description: Danh sách lỗi AI phát hiện
 *                   items:
 *                     type: object
 *                     properties:
 *                       file:
 *                         type: string
 *                         example: main.js
 *                       line:
 *                         type: integer
 *                         example: 12
 *                       error:
 *                         type: string
 *                         example: Missing semicolon
 *                       fix:
 *                         type: string
 *                         example: Add semicolon at end of line
 *
 *       400:
 *         description: ID không hợp lệ hoặc không có code để phân tích
 *         content:
 *           application/json:
 *             example:
 *               message: ID không hợp lệ
 *
 *       401:
 *         description: Không có token hoặc chưa đăng nhập
 *
 *       403:
 *         description: Không có quyền truy cập submission này
 *         content:
 *           application/json:
 *             example:
 *               message: Bạn không có quyền truy cập submission này
 *
 *       404:
 *         description: Không tìm thấy bài nộp
 *         content:
 *           application/json:
 *             example:
 *               message: Không tìm thấy bài nộp
 *
 *       500:
 *         description: Lỗi server hoặc lỗi AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
/**
 * @swagger
 * /api/submissions/upload:
 *   post:
 *     summary: Nộp bài tập (hỗ trợ file code hoặc ZIP, tự nhận diện ngôn ngữ)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File code (.js, .java, .cpp, ...) hoặc file ZIP chứa nhiều file
 *     responses:
 *       201:
 *         description: Nộp bài thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Nộp bài thành công!
 *                 submissionId:
 *                   type: integer
 *                   example: 5
 *                 language:
 *                   type: string
 *                   example: JavaScript
 *       400:
 *         description: Không có file được upload
 *         content:
 *           application/json:
 *             example:
 *               message: Vui lòng chọn file code!
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             example:
 *               message: Lỗi hệ thống
 *               error: Internal server error
 */
/**
 * @swagger
 * /api/submissions:
 *   get:
 *     summary: Lấy danh sách bài nộp của sinh viên hiện tại
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách bài nộp thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       FileName:
 *                         type: string
 *                         example: code.zip
 *                       Language:
 *                         type: string
 *                         example: JavaScript
 *                       Status:
 *                         type: string
 *                         example: done
 *                       CreatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-04-05T10:30:00.000Z
 *                       analysisId:
 *                         type: integer
 *                         nullable: true
 *                         example: 12
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             example:
 *               message: Không thể lấy danh sách bài nộp
 */