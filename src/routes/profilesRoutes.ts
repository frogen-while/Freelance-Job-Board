import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/http.js';
import {
  getProfileByUserId,
  getProfileSkills,
  setProfileSkills,
  upsertProfile,
  getFreelancers,
  getFeaturedFreelancers,
  getFreelancerProfile,
  upsertFreelancerProfile,
  getEmployerProfile,
  upsertEmployerProfile,
  getEmployers
} from '../controllers/profilesController.js';

const router = Router();

router.get('/freelancers', asyncHandler(getFreelancers));
router.get('/freelancers/featured', asyncHandler(getFeaturedFreelancers));

router.get('/employers', asyncHandler(getEmployers));

router.get('/:userId', asyncHandler(getProfileByUserId));
router.put('/:userId', requireAuth, asyncHandler(upsertProfile));
router.get('/:userId/skills', asyncHandler(getProfileSkills));
router.put('/:userId/skills', requireAuth, asyncHandler(setProfileSkills));

router.get('/:userId/freelancer', asyncHandler(getFreelancerProfile));
router.put('/:userId/freelancer', requireAuth, asyncHandler(upsertFreelancerProfile));

router.get('/:userId/employer', asyncHandler(getEmployerProfile));
router.put('/:userId/employer', requireAuth, asyncHandler(upsertEmployerProfile));

export default router;
