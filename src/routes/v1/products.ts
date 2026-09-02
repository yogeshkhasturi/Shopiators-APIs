import { Router } from 'express';
import { ProductController } from '../../controllers/ProductController';
import { authenticate, requireScope } from '../../middleware/auth';
import { idempotencyMiddleware } from '../../middleware/idempotency';

const router = Router();

// Apply authentication to all product routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of products
 *   post:
 *     summary: Create product
 *     description: |
 *       Creates a new product in the store. 
 *       
 *       **Instructions**:
 *       1. Provide a `title`.
 *       2. Optionally provide a `handle` (URL slug). If omitted, one will be generated from the title.
 *       3. Set the `status` to 'active', 'draft', or 'archived'.
 *       4. Link to existing `selectedCollections` (must be valid ObjectIds belonging to your store).
 *     tags: [Products]
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
 *                 description: The name of the product
 *               handle:
 *                 type: string
 *                 description: URL friendly slug
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, draft, archived]
 *               comparePrice:
 *                 type: number
 *                 description: Original price for strike-through (mapped to salePrice)
 *               sizeChart:
 *                 type: string
 *                 description: URL or base64 data URI of the size chart
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs or base64 data URIs
 *               selectedCollections:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of Collection ObjectIds
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     values:
 *                       type: array
 *                       items:
 *                         type: string
 *             example:
 *               title: "Premium Cotton T-Shirt"
 *               handle: "premium-cotton-t-shirt"
 *               description: "A comfortable 100% cotton t-shirt."
 *               status: "active"
 *               price: 15.00
 *               comparePrice: 20.00
 *               metaTitle: "Buy Premium Cotton T-Shirt Online"
 *               metaDescription: "100% Cotton T-Shirt, available in multiple sizes and colors."
 *               images: ["https://example.com/image1.jpg"]
 *               sizeChart: "https://example.com/sizechart.jpg"
 *               selectedCollections: []
 *               options:
 *                 - name: "Size"
 *                   values: ["Small", "Medium", "Large"]
 *                 - name: "Color"
 *                   values: ["Red", "Blue"]
 *     responses:
 *       201:
 *         description: Created product
 */
router.get('/', requireScope('products:read'), ProductController.list);
router.post('/', requireScope('products:write'), idempotencyMiddleware, ProductController.create);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product
 *     tags: [Products]
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
 *         description: Product details
 *   patch:
 *     summary: Update product
 *     tags: [Products]
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
 *               status:
 *                 type: string
 *                 enum: [active, draft, archived]
 *               price:
 *                 type: number
 *               comparePrice:
 *                 type: number
 *               sizeChart:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               selectedCollections:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Updated product
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
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
 *         description: Product deleted
 */
router.get('/:id', requireScope('products:read'), ProductController.get);
router.patch('/:id', requireScope('products:write'), ProductController.update);
router.delete('/:id', requireScope('products:write'), ProductController.delete);

export default router;
