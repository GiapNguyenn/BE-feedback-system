/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách user
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Đăng nhập hệ thống
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login thành công
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: admin@gmail.com
 *                     fullName:
 *                       type: string
 *                       example: Nguyễn Văn A
 *                     role:
 *                       type: string
 *                       example: admin
 *                     studentCode:
 *                       type: string
 *                       example: SV001
 *
 *       401:
 *         description: Sai mật khẩu
 *       404:
 *         description: Email không tồn tại
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Đăng ký tài khoản
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentCode
 *               - email
 *               - fullName
 *               - password
 *             properties:
 *               studentCode:
 *                 type: string
 *                 example: SV001
 *               email:
 *                 type: string
 *                 example: sv01@gmail.com
 *               fullName:
 *                 type: string
 *                 example: Nguyen Van A
 *               password:
 *                 type: string
 *                 example: 123456
 *               roleId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công
 */
/**
 * @swagger
 * /api/users/update:
 *   put:
 *     summary: Cập nhật thông tin user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentCode
 *             properties:
 *               studentCode:
 *                 type: string
 *                 description: Mã sinh viên 
 *                 example: SV001
 *               email:
 *                 type: string
 *                 example: newmail@gmail.com
 *               fullName:
 *                 type: string
 *                 example: ten can doi
 *               password:
 *                 type: string
 *                 example: newpassword
 *               roleId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Lỗi dữ liệu
 *       500:
 *         description: Lỗi server
 */
/**
 * @swagger
 * /api/users/{studentCode}:
 *   get:
 *     summary: Tìm user theo studentCode
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: studentCode
 *         required: true
 *         schema:
 *           type: string
 *         example: SV001
 *     responses:
 *       200:
 *         description: Lấy thông tin user thành công
 *       404:
 *         description: Không tìm thấy user
 */