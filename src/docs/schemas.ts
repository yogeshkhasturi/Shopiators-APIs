/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         handle:
 *           type: string
 *         description:
 *           type: string
 *         image:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [active, disabled]
 *         price:
 *           type: number
 *         totalStock:
 *           type: number
 *
 *     Variant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         productId:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: number
 *         sku:
 *           type: string
 */
