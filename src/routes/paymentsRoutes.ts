import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/http.js';
import { createPayment, updatePayment, getAllPayments, getPaymentById, deletePayment, processCheckout } from '../controllers/paymentsController.js';

const router = Router();

router.post('/checkout', requireAuth, asyncHandler(processCheckout));
router.post('/', requireAuth, asyncHandler(createPayment));
router.get('/', requireAuth, asyncHandler(getAllPayments));
router.get('/:id', requireAuth, asyncHandler(getPaymentById));
router.delete('/:id', requireAuth, asyncHandler(deletePayment));
router.put('/:id', requireAuth, asyncHandler(updatePayment));

export default router;