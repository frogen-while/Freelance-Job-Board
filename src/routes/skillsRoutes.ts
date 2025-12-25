import { Router } from 'express';
import { createSkill, deleteSkill, getAllSkills } from '../controllers/skillsController.js';

const router = Router();

router.get('/', getAllSkills);
router.post('/', createSkill);
router.delete('/:id', deleteSkill);

export default router;
