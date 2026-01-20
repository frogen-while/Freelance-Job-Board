import { Router } from 'express';
import { 
  getAllUsers, 
  assignRole, 
  blockUser, 
  unblockUser, 
  getAuditLogs,
  bulkBlockUsers,
  bulkUnblockUsers,
  bulkAssignRole,
  bulkUpdateTicketStatus,
  bulkDeleteTickets
} from '../controllers/adminController.js';
import {
  getOverviewStats,
  getRevenueStats,
  getUserStats,
  getJobStats
} from '../controllers/adminStatsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin, requireManager, requireSupport } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();

router.use(requireAuth);

router.get('/stats/overview', requireManager, asyncHandler(getOverviewStats));
router.get('/stats/revenue', requireManager, asyncHandler(getRevenueStats));
router.get('/stats/users', requireManager, asyncHandler(getUserStats));
router.get('/stats/jobs', requireManager, asyncHandler(getJobStats));

router.get('/users', requireManager, asyncHandler(getAllUsers));
router.patch('/users/:id/role', requireManager, asyncHandler(assignRole));
router.patch('/users/:id/block', requireAdmin, asyncHandler(blockUser));
router.patch('/users/:id/unblock', requireAdmin, asyncHandler(unblockUser));
router.post('/users/bulk/block', requireAdmin, asyncHandler(bulkBlockUsers));
router.post('/users/bulk/unblock', requireAdmin, asyncHandler(bulkUnblockUsers));
router.post('/users/bulk/role', requireManager, asyncHandler(bulkAssignRole));

router.post('/tickets/bulk/status', requireSupport, asyncHandler(bulkUpdateTicketStatus));
router.post('/tickets/bulk/delete', requireManager, asyncHandler(bulkDeleteTickets));

router.get('/audit-logs', requireAdmin, asyncHandler(getAuditLogs));

export default router;
