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
 *     parameters:
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, -createdAt, title, -title]
 *     responses:
 *       200:
 *         description: A list of collections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Collection'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
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
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Summer Sale"
 *               handle:
 *                 type: string
 *                 example: "summer-sale"
 *               description:
 *                 type: string
 *                 example: "Best deals of the summer."
 *               image:
 *                 type: string
 *                 example: "https://images.example.com/banner.jpg"
 *               collectionType:
 *                 type: string
 *                 enum: [manual, smart]
 *                 example: manual
 *               selectedProducts:
 *                 type: array
 *                 description: Array of Product ObjectIds (for manual collections)
 *                 items:
 *                   type: string
 *                 example: []
 *               parentCollection:
 *                 type: string
 *                 description: ObjectId of parent collection
 *               matchType:
 *                 type: string
 *                 enum: [all condition, any condition]
 *                 description: For smart collections
 *               conditions:
 *                 type: array
 *                 description: Smart collection filter rules
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       example: "title"
 *                     operator:
 *                       type: string
 *                       example: "contains"
 *                     value:
 *                       type: string
 *                       example: "shirt"
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *               metaKeywords:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created collection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Collection'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', requireScope('collections:read'), CollectionController.list);
router.post('/', requireScope('collections:write'), idempotencyMiddleware, CollectionController.create);

/**
 * @swagger
 * /collections/{id}:
 *   get:
 *     summary: Get a collection by ID
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "64f1e2b3c9e77b001f8e4ddd"
 *     responses:
 *       200:
 *         description: Collection details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Collection'
 *       404:
 *         description: Collection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *               parentCollection:
 *                 type: string
 *               matchType:
 *                 type: string
 *                 enum: [all condition, any condition]
 *               conditions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                     operator:
 *                       type: string
 *                     value:
 *                       type: string
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *               metaKeywords:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated collection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Collection'
 *       404:
 *         description: Collection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *       404:
 *         description: Collection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', requireScope('collections:read'), CollectionController.get);
router.patch('/:id', requireScope('collections:write'), idempotencyMiddleware, CollectionController.update);
router.delete('/:id', requireScope('collections:write'), CollectionController.delete);

export default router;
