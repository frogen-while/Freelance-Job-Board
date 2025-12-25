import { Router } from 'express';
import { getProfileByUserId, getProfileSkills, setProfileSkills, upsertProfile } from '../controllers/profilesController.js';

const router = Router();

router.get('/:userId', getProfileByUserId);
router.put('/:userId', upsertProfile);
router.get('/:userId/skills', getProfileSkills);
router.put('/:userId/skills', setProfileSkills);

export default router;
