import { Router } from 'express';
import { getProfileByUserId, getProfileSkills, setProfileSkills, upsertProfile, getFreelancers, getFeaturedFreelancers } from '../controllers/profilesController.js';

const router = Router();

router.get('/freelancers', getFreelancers);
router.get('/freelancers/featured', getFeaturedFreelancers);
router.get('/:userId', getProfileByUserId);
router.put('/:userId', upsertProfile);
router.get('/:userId/skills', getProfileSkills);
router.put('/:userId/skills', setProfileSkills);

export default router;
