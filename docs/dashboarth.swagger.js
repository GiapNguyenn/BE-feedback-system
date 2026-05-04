/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Lấy thống kê dashboard admin
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dữ liệu thống kê dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 120
 *                     totalAssignments:
 *                       type: integer
 *                       example: 15
 *                     totalSubmissions:
 *                       type: integer
 *                       example: 340
 *                     totalErrors:
 *                       type: integer
 *                       example: 98
 *                 languages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       language:
 *                         type: string
 *                         example: C#
 *                       count:
 *                         type: integer
 *                         example: 120
 *                 trends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         example: 2026-03-16
 *                       submissions:
 *                         type: integer
 *                         example: 25
 *       500:
 *         description: Lỗi server khi lấy dữ liệu dashboard
 */