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
 *         name: handle
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, disabled]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, -createdAt, price, -price, title, -title]
 *     responses:
 *       200:
 *         description: A list of products
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
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Create product
 *     description: |
 *       Creates a new product in the store.
 *
 *       **Notes**:
 *       - `handle` is auto-generated from title if not provided (guaranteed unique).
 *       - `comparePrice` must be **≥** `price`, otherwise a validation error is returned.
 *       - `images` accepts URLs or base64 data URIs — they will be uploaded to FTP automatically.
 *       - `selectedCollections` must be valid ObjectIds belonging to the same store.
 *       - Providing `options` (e.g. Size, Color) will auto-generate variants and attribute combinations.
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
 *                 example: "Premium Cotton T-Shirt"
 *               handle:
 *                 type: string
 *                 description: URL slug. Must be unique per store. Auto-generated if omitted.
 *                 example: "premium-cotton-t-shirt"
 *               description:
 *                 type: string
 *                 example: "A comfortable 100% cotton t-shirt."
 *               status:
 *                 type: string
 *                 enum: [active, disabled]
 *                 example: active
 *               price:
 *                 type: number
 *                 example: 15.00
 *               comparePrice:
 *                 type: number
 *                 description: Compare at / original price. Must be >= price.
 *                 example: 20.00
 *               totalStock:
 *                 type: number
 *                 example: 100
 *               images:
 *                 type: array
 *                 description: Array of image URLs or base64 data URIs
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/image1.jpg"]
 *               sizeChart:
 *                 type: string
 *                 description: URL or base64 data URI of the size chart
 *                 example: "https://example.com/sizechart.jpg"
 *               selectedCollections:
 *                 type: array
 *                 description: Array of Collection ObjectIds
 *                 items:
 *                   type: string
 *                 example: []
 *               metaTitle:
 *                 type: string
 *                 example: "Buy Premium Cotton T-Shirt Online"
 *               metaDescription:
 *                 type: string
 *                 example: "100% Cotton T-Shirt in multiple sizes."
 *               options:
 *                 type: array
 *                 description: Product variant options. Each option generates variants automatically.
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Size"
 *                     values:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Small", "Medium", "Large"]
 *     responses:
 *       201:
 *         description: Created product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', requireScope('products:read'), ProductController.list);
router.post('/', requireScope('products:write'), idempotencyMiddleware, ProductController.create);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "64f1e2b3c9e77b001f8e4ccc"
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   patch:
 *     summary: Update product
 *     description: |
 *       All fields are optional. `comparePrice` must remain >= `price` if both are provided.
 *       Providing a `handle` that already belongs to another product will return a 400 error.
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
 *                 description: Must be unique per store
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, disabled]
 *               price:
 *                 type: number
 *               comparePrice:
 *                 type: number
 *                 description: Must be >= price
 *               totalStock:
 *                 type: number
 *               images:
 *                 type: array
 *                 description: Existing URLs (kept as-is) or base64 data URIs (re-uploaded)
 *                 items:
 *                   type: string
 *               sizeChart:
 *                 type: string
 *               selectedCollections:
 *                 type: array
 *                 items:
 *                   type: string
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete product
 *     description: Deletes a product along with its variants and attribute combinations (cascade delete).
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
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', requireScope('products:read'), ProductController.get);
router.patch('/:id', requireScope('products:write'), ProductController.update);
router.delete('/:id', requireScope('products:write'), ProductController.delete);

export default router;

