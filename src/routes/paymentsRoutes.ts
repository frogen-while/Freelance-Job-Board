import { Router } from 'express';
import { createPayment, updatePayment, getAllPayments, getPaymentById, deletePayment} from '../controllers/paymentsController.js';

const router = Router();

router.post('/', createPayment); 
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.delete('/:id', deletePayment);
router.put('/:id', updatePayment);

export default router;