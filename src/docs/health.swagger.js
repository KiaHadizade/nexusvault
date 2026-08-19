/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is running
 */

/**
 * @swagger
 * /api/health/protected:
 *   get:
 *     summary: Test authenticated access
 *     tags:
 *       - Health
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authentication successful
 *       401:
 *         description: Authentication required or token invalid
 */