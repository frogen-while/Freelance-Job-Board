import { Router } from 'express';
import { asyncHandler } from '../utils/http.js';
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

router.post('/', asyncHandler(createReview));
router.get('/', asyncHandler(getAllReviews));
router.get('/:id', asyncHandler(getReviewById));
router.put('/:id', asyncHandler(updateReview));
router.delete('/:id', asyncHandler(deleteReview));

router.get('/user/:userId', asyncHandler(getReviewsByUser));
router.get('/user/:userId/rating', asyncHandler(getUserRating));

export default router;
