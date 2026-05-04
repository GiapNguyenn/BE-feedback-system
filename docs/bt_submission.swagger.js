/**
 * @swagger
 * components:
 *   schemas:
 *     SubmissionUpload:
 *       type: object
 *       required:
 *         - assignmentId
 *         - mssv
 *         - studentName
 *         - file
 *       properties:
 *         assignmentId:
 *           type: integer
 *           example: 1
 *         mssv:
 *           type: string
 *           example: "21123456"
 *         studentName:
 *           type: string
 *           example: "Nguyen Van A"
 *         file:
 *           type: string
 *           format: binary
 */

/**
 * @swagger
 * /api/test_mock_submissions/upload:
 *   post:
 *     summary: Sinh viên nộp bài tập (upload file)
 *     tags: [test_mock_Submissions]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/SubmissionUpload'
 *     responses:
 *       201:
 *         description: Nộp bài thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nộp bài thành công
 *                 submissionId:
 *                   type: integer
 *                   example: 10
 *                 filePath:
 *                   type: string
 *                   example: uploads/171000000-file.zip
 *       400:
 *         description: Lỗi khi upload
 */
/**
 * @swagger
 * /api/test_mock_submissions/{assignmentId}:
 *   get:
 *     summary: Lấy danh sách bài nộp theo assignmentId
 *     tags: [test_mock_Submissions]
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bài tập
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lấy danh sách thành công
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       externalId:
 *                         type: integer
 *                         example: 1001
 *                       assignmentId:
 *                         type: integer
 *                         example: 1
 *                       assignmentTitle:
 *                         type: string
 *                         example: "Bài tập vòng lặp"
 *                       language:
 *                         type: string
 *                         example: "C#"
 *                       mssv:
 *                         type: string
 *                         example: "21123456"
 *                       studentName:
 *                         type: string
 *                         example: "Nguyen Van A"
 *                       exerciseFileUrl:
 *                         type: string
 *                         example: "uploads/abc.zip"
 *                       submittedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-03-19T10:00:00Z"
 *       400:
 *         description: assignmentId không hợp lệ
 *       500:
 *         description: Lỗi server
 */
/**
 * @swagger
 * /api/test_mock_submissions/student/{mssv}:
 *   get:
 *     summary: Lấy danh sách bài nộp theo MSSV
 *     tags: [test_mock_Submissions]
 *     parameters:
 *       - in: path
 *         name: mssv
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã số sinh viên
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lấy danh sách thành công
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       externalId:
 *                         type: integer
 *                       assignmentId:
 *                         type: integer
 *                       assignmentTitle:
 *                         type: string
 *                       description:
 *                         type: string
 *                       language:
 *                         type: string
 *                       mssv:
 *                         type: string
 *                       studentName:
 *                         type: string
 *                       exerciseFileUrl:
 *                         type: string
 *                       submittedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Thiếu MSSV
 *       500:
 *         description: Lỗi server
 */