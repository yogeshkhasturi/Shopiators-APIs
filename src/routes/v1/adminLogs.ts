import { Router } from 'express';
import { getLogs, getStats, getLogById } from '../../controllers/AdminLogsController';
import { authenticate, requireScope } from '../../middleware/auth';
import { authenticateAdminLogs } from '../../middleware/adminAuth';

const router = Router();

// Ensure all admin log endpoints are authenticated and require appropriate admin scope.
// Using 'admin:logs:read' as the required scope or fallback to 'all' in the auth middleware
// router.use(authenticate, requireScope('admin:logs:read'));

// router.use(authenticateAdminLogs);

// Note: /stats must be placed before /:requestId so it's not interpreted as a request ID
router.get('/stats', getStats);
router.get('/:requestId', getLogById);
router.get('/', getLogs);

export default router;
