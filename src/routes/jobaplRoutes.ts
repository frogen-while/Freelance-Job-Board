import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/http.js';
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

router.get('/job/:jobId', requireAuth, asyncHandler(getApplicationsByJobId));
router.get('/freelancer/:freelancerId', requireAuth, asyncHandler(getApplicationsByFreelancerId));
router.patch('/:id/status', requireAuth, asyncHandler(updateApplicationStatus));

router.post('/', requireAuth, asyncHandler(createJobApplication));
router.get('/', asyncHandler(getAllJobApplications));
router.get('/:id', asyncHandler(getJobApplicationById));
router.delete('/:id', requireAuth, asyncHandler(deleteJobApplication));
router.put('/:id', requireAuth, asyncHandler(updateJobApplication));

export default router;