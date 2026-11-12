import { Router } from 'express';
import { StoreController } from '../../controllers/StoreController';
import { authenticate, requireScope } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /store:
 *   get:
 *     summary: Get authenticated store metadata
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Store metadata
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Store not found
 */
router.get('/', requireScope('store:read'), StoreController.get);

export default router;

