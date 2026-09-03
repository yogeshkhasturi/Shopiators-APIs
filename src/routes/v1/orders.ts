import { Router } from 'express';
import { OrderController } from '../../controllers/OrderController';
import { authenticate, requireScope } from '../../middleware/auth';
import { idempotencyMiddleware } from '../../middleware/idempotency';

const router = Router();

// Apply authentication to all order routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: List orders
 *     tags: [Orders]
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
 *         name: status
 *         schema:
 *           type: string
 *           description: Filter by orderStatus
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           description: Filter by paymentStatus
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, -createdAt, totalAmount, -totalAmount]
 *           default: -createdAt
 *     responses:
 *       200:
 *         description: A list of orders
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
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Create an order
 *     description: |
 *       Creates a new order in the store. Useful for migration workflows or custom checkouts.
 *       
 *       **Notes**:
 *       - `customOrderId` will be auto-generated (e.g. `ORD-...`) if not provided.
 *       - You must provide at least one item in `cartItems`.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartItems
 *               - subTotal
 *               - totalAmount
 *             properties:
 *               customOrderId:
 *                 type: string
 *                 description: Unique identifier for the order. Auto-generated if omitted.
 *                 example: "ORD-12345"
 *               cartItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - title
 *                     - price
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: number
 *                     sku:
 *                       type: string
 *               shippingAddress:
 *                 $ref: '#/components/schemas/Address'
 *               billingAddress:
 *                 $ref: '#/components/schemas/Address'
 *               contactEmail:
 *                 type: string
 *                 example: "customer@example.com"
 *               orderStatus:
 *                 type: string
 *                 example: "pending"
 *               paymentMethod:
 *                 type: string
 *                 example: "credit_card"
 *               paymentStatus:
 *                 type: string
 *                 example: "paid"
 *               subTotal:
 *                 type: number
 *                 example: 50.00
 *               shippingCharge:
 *                 type: number
 *                 example: 5.00
 *               taxAmount:
 *                 type: number
 *                 example: 5.50
 *               totalAmount:
 *                 type: number
 *                 example: 60.50
 *               currency:
 *                 type: string
 *                 default: "USD"
 *     responses:
 *       201:
 *         description: Created order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', requireScope('orders:read'), OrderController.list);
router.post('/', requireScope('orders:write'), idempotencyMiddleware, OrderController.create);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
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
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   patch:
 *     summary: Update an order
 *     description: |
 *       Update the order status, payment status, tracking info, or handle refunds/returns.
 *       Fields will be deeply merged where applicable (e.g., updating `refund.status` leaves the rest of the refund object intact).
 *     tags: [Orders]
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
 *               orderStatus:
 *                 type: string
 *                 example: "fulfilled"
 *               paymentStatus:
 *                 type: string
 *                 example: "paid"
 *               trackingInfo:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     trackingNumber:
 *                       type: string
 *                     shippingCarrier:
 *                       type: string
 *                     trackingUrl:
 *                       type: string
 *               refund:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     example: "Approved"
 *                   adminRemark:
 *                     type: string
 *     responses:
 *       200:
 *         description: Updated order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', requireScope('orders:read'), OrderController.get);
router.patch('/:id', requireScope('orders:write'), OrderController.update);

export default router;
