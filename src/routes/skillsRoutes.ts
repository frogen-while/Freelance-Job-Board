import { Router } from 'express';
import { createSkill, deleteSkill, getAllSkills } from '../controllers/skillsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireManager } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();

router.get('/', asyncHandler(getAllSkills));

router.post('/', requireAuth, requireManager, asyncHandler(createSkill));
router.delete('/:id', requireAuth, requireManager, asyncHandler(deleteSkill));

export default router;
