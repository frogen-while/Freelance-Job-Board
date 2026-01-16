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
import {
  flagJob,
  getJobFlags,
  getPendingFlags,
  reviewFlag,
  hideJob,
  restoreJob,
  getHiddenJobs
} from '../controllers/adminModerationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin, requireManager, requireSupport } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/stats/overview', requireManager, getOverviewStats);
router.get('/stats/revenue', requireManager, getRevenueStats);
router.get('/stats/users', requireManager, getUserStats);
router.get('/stats/jobs', requireManager, getJobStats);

router.get('/users', requireManager, getAllUsers);
router.patch('/users/:id/role', requireManager, assignRole);
router.patch('/users/:id/block', requireAdmin, blockUser);
router.patch('/users/:id/unblock', requireAdmin, unblockUser);
router.post('/users/bulk/block', requireAdmin, bulkBlockUsers);
router.post('/users/bulk/unblock', requireAdmin, bulkUnblockUsers);
router.post('/users/bulk/role', requireManager, bulkAssignRole);

router.get('/jobs/flags/pending', requireSupport, getPendingFlags);
router.get('/jobs/hidden', requireManager, getHiddenJobs);
router.post('/jobs/:id/flag', requireSupport, flagJob);
router.get('/jobs/:id/flags', requireSupport, getJobFlags);
router.patch('/jobs/flags/:flagId', requireManager, reviewFlag);
router.post('/jobs/:id/hide', requireManager, hideJob);
router.post('/jobs/:id/restore', requireManager, restoreJob);

router.post('/tickets/bulk/status', requireSupport, bulkUpdateTicketStatus);
router.post('/tickets/bulk/delete', requireManager, bulkDeleteTickets);

router.get('/audit-logs', requireAdmin, getAuditLogs);

export default router;
