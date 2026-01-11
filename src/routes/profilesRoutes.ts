import { Router } from 'express';
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
router.get('/freelancers', getFreelancers);
router.get('/freelancers/featured', getFeaturedFreelancers);

// Employer listings
router.get('/employers', getEmployers);

// Base profile routes
router.get('/:userId', getProfileByUserId);
router.put('/:userId', upsertProfile);
router.get('/:userId/skills', getProfileSkills);
router.put('/:userId/skills', setProfileSkills);

// Freelancer-specific profile
router.get('/:userId/freelancer', getFreelancerProfile);
router.put('/:userId/freelancer', upsertFreelancerProfile);

// Employer-specific profile
router.get('/:userId/employer', getEmployerProfile);
router.put('/:userId/employer', upsertEmployerProfile);

export default router;
