/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: Get the user's files
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Upload a file
 *     tags:
 *       - Files
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
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/files/{id}/download:
 *   get:
 *     summary: Download a file
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the file
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Delete a file
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the file
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */