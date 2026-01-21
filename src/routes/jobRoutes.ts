import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/http.js';
import { createJob, getAllJobs, getJobById, getJobsByEmployerId, updateJob, deleteJob} from '../controllers/jobController.js';

const router = Router();

router.post('/', requireAuth, asyncHandler(createJob));
router.get('/', asyncHandler(getAllJobs));
router.get('/employer/:employerId', asyncHandler(getJobsByEmployerId));
router.get('/:id', asyncHandler(getJobById));
router.delete('/:id', requireAuth, asyncHandler(deleteJob));
router.put('/:id', requireAuth, asyncHandler(updateJob));

export default router;