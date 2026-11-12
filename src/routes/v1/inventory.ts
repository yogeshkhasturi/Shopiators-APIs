import { Router } from 'express';
import { InventoryController } from '../../controllers/InventoryController';
import { authenticate, requireScope } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /inventory/alerts:
 *   get:
 *     summary: Get low-stock and out-of-stock inventory alerts
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           default: 5
 *       - in: query
 *         name: includeOutOfStock
 *         schema:
 *           type: boolean
 *           default: true
 *       - in: query
 *         name: includeDisabled
 *         schema:
 *           type: boolean
 *           default: false
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *     responses:
 *       200:
 *         description: List of low-stock alerts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/alerts', requireScope('inventory:read'), InventoryController.getAlerts);

export default router;

