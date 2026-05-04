/**
 * @swagger
 * tags:
 *   name: Analysis
 *   description: Quản lý phân tích bài nộp và chat lỗi
 */

/**
 * @swagger
 * /api/analysis/history/{id}:
 *   get:
 *     summary: Lấy kết quả phân tích mới nhất của bài nộp
 *     description: Trả về lần phân tích gần nhất (TOP 1) của submission kèm danh sách lỗi (issues)
 *     tags: [Analysis]
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của submission
 *         schema:
 *           type: integer
 *           example: 12
 *
 *     responses:
 *
 *       200:
 *         description: Thành công (có thể trả về null nếu chưa có dữ liệu phân tích)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 # Trường hợp có dữ liệu
 *                 - type: object
 *                   properties:
 *                     analysisId:
 *                       type: integer
 *                       example: 3
 *
 *                     assignmentTitle:
 *                       type: string
 *                       description: Tên file bài nộp
 *                       example: "code.js"
 *
 *                     issues:
 *                       type: array
 *                       description: Danh sách lỗi được phát hiện
 *                       items:
 *                         type: object
 *                         properties:
 *                           lineNumber:
 *                             type: integer
 *                             example: 5
 *
 *                           message:
 *                             type: string
 *                             example: "Sai cú pháp vòng lặp"
 *
 *                           suggestion:
 *                             type: string
 *                             example: "Sửa điều kiện for đúng cú pháp"
 *
 *                 # Trường hợp chưa có phân tích
 *                 - type: "null"
 *                   example: null
 *
 *       500:
 *         description: Lỗi server khi truy vấn dữ liệu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi lấy dữ liệu lịch sử"
 */

/**
 * @swagger
 * /api/analysis/{analysisId}/chat:
 *   post:
 *     summary: Chat hỏi thêm sau khi phân tích bài (theo thread)
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: analysisId
 *         required: true
 *         description: ID của lần phân tích
 *         schema:
 *           type: integer
 *           example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 example: Tại sao lỗi này xảy ra?
 *     responses:
 *       200:
 *         description: AI trả lời câu hỏi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   example: Lỗi này xảy ra do truy cập vượt giới hạn mảng...
 *
 *       401:
 *         description: Không có token
 *
 *       403:
 *         description: Token không hợp lệ
 *
 *       500:
 *         description: Lỗi server
 */
/**
 * @swagger
 * /api/analysis/{analysisId}/chat:
 *   get:
 *     summary: Lấy toàn bộ lịch sử chat của lần phân tích
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: analysisId
 *         required: true
 *         description: ID của lần phân tích
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Danh sách chat
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   role:
 *                     type: string
 *                     example: user
 *                   message:
 *                     type: string
 *                     example: Tại sao lỗi này xảy ra?
 *                   createdAt:
 *                     type: string
 *                     example: 2026-03-22T10:00:00.000Z
 *
 *       401:
 *         description: Không có token
 *
 *       403:
 *         description: Token không hợp lệ
 *
 *       500:
 *         description: Lỗi server
 */