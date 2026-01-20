import { Router } from 'express';
import { 
    createSupportTicket, 
    updateSupportTicket, 
    getAllSupportTickets, 
    getSupportTicketById, 
    deleteSupportTicket,
    escalateSupportTicket,
    getMySupportTickets,
    assignTicket,
    updateTicketPriority,
    getTicketsFiltered,
    bulkUpdateTicketStatus
} from '../controllers/supportticketsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireSupport, requireManager } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();

router.post('/', requireAuth, asyncHandler(createSupportTicket)); 

router.get('/my', requireAuth, asyncHandler(getMySupportTickets));

router.get('/filtered', requireAuth, requireSupport, asyncHandler(getTicketsFiltered));

router.post('/bulk-status', requireAuth, requireSupport, asyncHandler(bulkUpdateTicketStatus));

router.get('/', requireAuth, requireSupport, asyncHandler(getAllSupportTickets));

router.get('/:id', requireAuth, requireSupport, asyncHandler(getSupportTicketById));

router.put('/:id', requireAuth, requireSupport, asyncHandler(updateSupportTicket));

router.post('/:id/escalate', requireAuth, requireSupport, asyncHandler(escalateSupportTicket));

router.post('/:id/assign', requireAuth, requireManager, asyncHandler(assignTicket));

router.patch('/:id/priority', requireAuth, requireSupport, asyncHandler(updateTicketPriority));

router.delete('/:id', requireAuth, requireManager, asyncHandler(deleteSupportTicket));

export default router;