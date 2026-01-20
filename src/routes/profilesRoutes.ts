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

// General freelancer listings
router.get('/freelancers', asyncHandler(getFreelancers));
router.get('/freelancers/featured', asyncHandler(getFeaturedFreelancers));

// Employer listings
router.get('/employers', asyncHandler(getEmployers));

// Base profile routes
router.get('/:userId', asyncHandler(getProfileByUserId));
router.put('/:userId', requireAuth, asyncHandler(upsertProfile));
router.get('/:userId/skills', asyncHandler(getProfileSkills));
router.put('/:userId/skills', requireAuth, asyncHandler(setProfileSkills));

// Freelancer-specific profile
router.get('/:userId/freelancer', asyncHandler(getFreelancerProfile));
router.put('/:userId/freelancer', requireAuth, asyncHandler(upsertFreelancerProfile));

// Employer-specific profile
router.get('/:userId/employer', asyncHandler(getEmployerProfile));
router.put('/:userId/employer', requireAuth, asyncHandler(upsertEmployerProfile));

export default router;
