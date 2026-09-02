import { Router } from 'express';
import { VariantController } from '../../controllers/VariantController';
import { authenticate, requireScope } from '../../middleware/auth';
import { idempotencyMiddleware } from '../../middleware/idempotency';

const router = Router({ mergeParams: true }); // Important for nested routes

// Apply authentication to all variant routes
router.use(authenticate);

// Routes
router.get('/', requireScope('variants:read'), VariantController.list);
router.post('/', requireScope('variants:write'), idempotencyMiddleware, VariantController.create);
router.get('/:id', requireScope('variants:read'), VariantController.get);
router.patch('/:id', requireScope('variants:write'), VariantController.update);
router.delete('/:id', requireScope('variants:write'), VariantController.delete);

export default router;
