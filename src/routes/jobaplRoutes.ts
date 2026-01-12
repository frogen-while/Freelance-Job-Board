import { Router } from 'express';
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
router.get('/job/:jobId', getApplicationsByJobId);
router.get('/freelancer/:freelancerId', getApplicationsByFreelancerId);
router.patch('/:id/status', updateApplicationStatus);

// Generic routes
router.post('/', createJobApplication); 
router.get('/', getAllJobApplications);
router.get('/:id', getJobApplicationById);
router.delete('/:id', deleteJobApplication);
router.put('/:id', updateJobApplication);

export default router;