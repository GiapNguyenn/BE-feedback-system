/**
 * @swagger
 * components:
 *   schemas:
 *     Assignment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         language:
 *           type: string
 */

/**
 * @swagger
 * /api/assignments/search:
 *   get:
 *     summary: Tìm bài tập theo tiêu đề
 *     tags: [Assignments]
 *     parameters:
 *       - in: query
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Tiêu đề bài tập cần tìm
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assignment'
 *       404:
 *         description: Không tìm thấy bài tập
 */