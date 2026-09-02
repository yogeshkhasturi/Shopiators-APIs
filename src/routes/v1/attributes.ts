import { Router } from 'express';
import { AttributeController } from '../../controllers/AttributeController';
import { authenticate, requireScope } from '../../middleware/auth';
import { idempotencyMiddleware } from '../../middleware/idempotency';

const router = Router();

// Apply authentication to all attribute routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Attributes
 *   description: Attribute management
 */

/**
 * @swagger
 * /attributes:
 *   get:
 *     summary: List attributes
 *     tags: [Attributes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of attributes
 *   post:
 *     summary: Create attribute
 *     tags: [Attributes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               attributeset:
 *                 type: string
 *               values:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Created attribute
 */
router.get('/', requireScope('attributes:read'), AttributeController.list);
router.post('/', requireScope('attributes:write'), idempotencyMiddleware, AttributeController.create);

/**
 * @swagger
 * /attributes/{id}:
 *   get:
 *     summary: Get an attribute
 *     tags: [Attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attribute details
 *   patch:
 *     summary: Update attribute
 *     tags: [Attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               attributeset:
 *                 type: string
 *               values:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Updated attribute
 *   delete:
 *     summary: Delete attribute
 *     tags: [Attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attribute deleted
 */
router.get('/:id', requireScope('attributes:read'), AttributeController.get);
router.patch('/:id', requireScope('attributes:write'), idempotencyMiddleware, AttributeController.update);
router.delete('/:id', requireScope('attributes:write'), AttributeController.delete);

export default router;
