import { Router } from 'express';
import { asyncHandler } from '../utils/http.js';
import { login, register, logout } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', requireAuth, asyncHandler(logout));

export default router;
