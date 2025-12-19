import { Router } from 'express';
import { createJobReview, updateJobReview, getAllJobReviews, getJobReviewById, deleteJobReview} from '../controllers/jobreviewController.js';

const router = Router();

router.post('/', createJobReview); 
router.get('/', getAllJobReviews);
router.get('/:id', getJobReviewById);
router.delete('/:id', deleteJobReview);
router.put('/:id', updateJobReview);

export default router;