import { Router } from 'express';
import { createSkill, deleteSkill, getAllSkills } from '../controllers/skillsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireManager } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', getAllSkills);

router.post('/', requireAuth, requireManager, createSkill);
router.delete('/:id', requireAuth, requireManager, deleteSkill);

export default router;
