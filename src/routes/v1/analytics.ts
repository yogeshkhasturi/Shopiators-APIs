import { Router } from 'express';
import { AnalyticsController } from '../../controllers/AnalyticsController';
import { authenticate, requireScope } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /analytics/sales:
 *   get:
 *     summary: Get tenant-scoped sales analytics (max 90-day window)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Sales analytics metrics
 *       400:
 *         description: Invalid date range (e.g. exceeds 90 days)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/sales', requireScope('orders:read'), AnalyticsController.getSales);

export default router;

