import { Router } from 'express';
import { AuthController } from '../../controllers/AuthController';
import rateLimit from 'express-rate-limit';

const router = Router();

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.PUBLIC_API_AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min default
  max: parseInt(process.env.PUBLIC_API_AUTH_RATE_LIMIT_MAX || '10', 10),
  keyGenerator: (req) => {
    // Attempt to rate limit by IP and storeSlug+email if present
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const email = req.body?.email || 'unknown';
    const storeSlug = req.body?.storeSlug || 'unknown';
    return `${ip}-${storeSlug}-${email}`;
  },
  validate: { ip: false },
  message: 'Too many authentication attempts. Please try again later.'
});

/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Authenticate merchant
 *     description: Authenticate a store admin using storeSlug, email, and password to receive a JWT access token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeSlug
 *               - email
 *               - password
 *             properties:
 *               storeSlug:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     tokenType:
 *                       type: string
 *                     expiresIn:
 *                       type: number
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many requests
 */
router.post('/', authLimiter, AuthController.login);

export default router;
