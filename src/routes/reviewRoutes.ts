import { Router } from 'express';
import {
    createReview,
    getAllReviews,
    getReviewById,
    getReviewsByUser,
    updateReview,
    deleteReview,
    getUserRating
} from '../controllers/reviewController.js';

const router = Router();

router.post('/', createReview);
router.get('/', getAllReviews);
router.get('/:id', getReviewById);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

router.get('/user/:userId', getReviewsByUser);
router.get('/user/:userId/rating', getUserRating);

export default router;
