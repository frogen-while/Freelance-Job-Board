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
    addTicketNote,
    getTicketNotes,
    getTicketsFiltered
} from '../controllers/supportticketsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireSupport, requireManager } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/', requireAuth, createSupportTicket); 

router.get('/my', requireAuth, getMySupportTickets);

router.get('/filtered', requireAuth, requireSupport, getTicketsFiltered);

router.get('/', requireAuth, requireSupport, getAllSupportTickets);

router.get('/:id', requireAuth, requireSupport, getSupportTicketById);

router.put('/:id', requireAuth, requireSupport, updateSupportTicket);

router.post('/:id/escalate', requireAuth, requireSupport, escalateSupportTicket);

router.post('/:id/assign', requireAuth, requireManager, assignTicket);

router.patch('/:id/priority', requireAuth, requireSupport, updateTicketPriority);

router.post('/:id/notes', requireAuth, requireSupport, addTicketNote);

router.get('/:id/notes', requireAuth, requireSupport, getTicketNotes);

router.delete('/:id', requireAuth, requireManager, deleteSupportTicket);

export default router;