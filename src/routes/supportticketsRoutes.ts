import { Router } from 'express';
import { createSupportTicket, updateSupportTicket, getAllSupportTickets, getSupportTicketById, deleteSupportTicket} from '../controllers/supportticketsController.js';

const router = Router();

router.post('/', createSupportTicket); 
router.get('/', getAllSupportTickets);
router.get('/:id', getSupportTicketById);
router.delete('/:id', deleteSupportTicket);
router.put('/:id', updateSupportTicket);

export default router;