import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { 
    createJobApplication, 
    getAllJobApplications, 
    getJobApplicationById, 
    deleteJobApplication, 
    updateJobApplication,
    getApplicationsByJobId,
    getApplicationsByFreelancerId,
    updateApplicationStatus
} from '../controllers/jobaplController.js';

const router = Router();

// Specific routes first
router.get('/job/:jobId', requireAuth, getApplicationsByJobId);
router.get('/freelancer/:freelancerId', requireAuth, getApplicationsByFreelancerId);
router.patch('/:id/status', requireAuth, updateApplicationStatus);

// Generic routes
router.post('/', requireAuth, createJobApplication); 
router.get('/', getAllJobApplications);
router.get('/:id', getJobApplicationById);
router.delete('/:id', requireAuth, deleteJobApplication);
router.put('/:id', requireAuth, updateJobApplication);

export default router;