import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createPayment, updatePayment, getAllPayments, getPaymentById, deletePayment} from '../controllers/paymentsController.js';

const router = Router();

router.post('/', requireAuth, createPayment); 
router.get('/', requireAuth, getAllPayments);
router.get('/:id', requireAuth, getPaymentById);
router.delete('/:id', requireAuth, deletePayment);
router.put('/:id', requireAuth, updatePayment);

export default router;