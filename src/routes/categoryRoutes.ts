import { Router } from 'express';
import { asyncHandler } from '../utils/http.js';
import { getAllCategories, createCategory, getCategoryById, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireManager } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', asyncHandler(getAllCategories));
router.get('/:id', asyncHandler(getCategoryById));

router.post('/', requireAuth, requireManager, asyncHandler(createCategory));
router.put('/:id', requireAuth, requireManager, asyncHandler(updateCategory));
router.delete('/:id', requireAuth, requireManager, asyncHandler(deleteCategory));

export default router;