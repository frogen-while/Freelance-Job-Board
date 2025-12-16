import { Router } from 'express';
import {getAllCategories, createCategory, getCategoryById, updateCategory, deleteCategory} from '../controllers/categoryController.js';

const router = Router();

router.get('/', getAllCategories);
router.post('/', createCategory);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;