import { Router } from 'express';
import { getAllCategories, createCategory, getCategoryById, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireManager } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

router.post('/', requireAuth, requireManager, createCategory);
router.put('/:id', requireAuth, requireManager, updateCategory);
router.delete('/:id', requireAuth, requireManager, deleteCategory);

export default router;