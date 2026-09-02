import { Router } from 'express';
import { CollectionController } from '../../controllers/CollectionController';
import { authenticate, requireScope } from '../../middleware/auth';
import { idempotencyMiddleware } from '../../middleware/idempotency';

const router = Router();

// Apply authentication to all collection routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Collections
 *   description: Collection management
 */

/**
 * @swagger
 * /collections:
 *   get:
 *     summary: List collections
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of collections
 *   post:
 *     summary: Create collection
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               handle:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               collectionType:
 *                 type: string
 *                 enum: [manual, smart]
 *               selectedProducts:
 *                 type: array
 *                 items:
 *                   type: string
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: Created collection
 */
router.get('/', requireScope('collections:read'), CollectionController.list);
router.post('/', requireScope('collections:write'), idempotencyMiddleware, CollectionController.create);

/**
 * @swagger
 * /collections/{id}:
 *   get:
 *     summary: Get a collection
 *     tags: [Collections]
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
 *         description: Collection details
 *   patch:
 *     summary: Update collection
 *     tags: [Collections]
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
 *               title:
 *                 type: string
 *               handle:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               collectionType:
 *                 type: string
 *                 enum: [manual, smart]
 *               selectedProducts:
 *                 type: array
 *                 items:
 *                   type: string
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated collection
 *   delete:
 *     summary: Delete collection
 *     tags: [Collections]
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
 *         description: Collection deleted
 */
router.get('/:id', requireScope('collections:read'), CollectionController.get);
router.patch('/:id', requireScope('collections:write'), idempotencyMiddleware, CollectionController.update);
router.delete('/:id', requireScope('collections:write'), CollectionController.delete);

export default router;
