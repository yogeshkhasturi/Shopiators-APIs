import { Router } from 'express';
import { getLogs, getStats, getLogById } from '../../controllers/AdminLogsController';
import { authorizeAdminLogs } from '../../middleware/adminAuth';

const router = Router();

// Ensure all admin log endpoints are authenticated and require ADMIN_LOGS_TOKEN or 'admin:logs:read' scope.
router.use(authorizeAdminLogs);

// Note: /stats must be placed before /:requestId so it's not interpreted as a request ID
router.get('/stats', getStats);
router.get('/:requestId', getLogById);
router.get('/', getLogs);

export default router;
