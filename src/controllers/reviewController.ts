import { Request, Response } from 'express';
import { reviewRepo } from '../repositories/reviewRepo.js';
import { jobRepo } from '../repositories/jobRepo.js';
import { parseIdParam, rethrowHttpError, sendError, sendSuccess } from '../utils/http.js';

export const createReview = async (req: Request, res: Response) => {
    const { job_id, reviewer_id, reviewee_id, rating, feedback } = req.body;

    if (job_id === undefined || reviewer_id === undefined || reviewee_id === undefined || rating === undefined) {
        return sendError(res, 400, 'job_id, reviewer_id, reviewee_id, and rating are required.');
    }

    if (rating < 1 || rating > 5) {
        return sendError(res, 400, 'Rating must be between 1 and 5.');
    }

    try {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return sendError(res, 404, 'Job not found.');
        }

        if (job.status !== 'Completed') {
            return sendError(res, 400, 'Can only review completed jobs.');
        }

        if (reviewer_id === reviewee_id) {
            return sendError(res, 400, 'Cannot review yourself.');
        }

        const hasReviewed = await reviewRepo.hasReviewed(job_id, reviewer_id);
        if (hasReviewed) {
            return sendError(res, 400, 'You have already reviewed this job.');
        }

        const reviewId = await reviewRepo.create({
            job_id,
            reviewer_id,
            reviewee_id,
            rating,
            feedback
        });

        if (reviewId) {
            return sendSuccess(res, { review_id: reviewId }, 201);
        } else {
            return sendError(res, 500, 'Failed to create review.');
        }
    } catch (error) {
        console.error('Error creating review:', error);
        rethrowHttpError(error, 500, 'An internal server error occurred.');
    }
};

export const getAllReviews = async (req: Request, res: Response) => {
    try {
        const { job_id, reviewer_id, reviewee_id } = req.query;

        let reviews;
        if (job_id) {
            reviews = await reviewRepo.findByJob(parseInt(job_id as string, 10));
        } else if (reviewer_id) {
            reviews = await reviewRepo.findByReviewer(parseInt(reviewer_id as string, 10));
        } else if (reviewee_id) {
            reviews = await reviewRepo.findByReviewee(parseInt(reviewee_id as string, 10));
        } else {
            reviews = await reviewRepo.get_all();
        }

        return sendSuccess(res, reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        rethrowHttpError(error, 500, 'An internal server error occurred.');
    }
};

export const getReviewById = async (req: Request, res: Response) => {
    const reviewId = parseIdParam(res, req.params.id, 'review');
    if (reviewId === null) return;

    try {
        const review = await reviewRepo.findById(reviewId);
        if (!review) {
            return sendError(res, 404, 'Review not found.');
        }
        return sendSuccess(res, review);
    } catch (error) {
        console.error(`Error fetching review ${reviewId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred.');
    }
};

export const getReviewsByUser = async (req: Request, res: Response) => {
    const userId = parseIdParam(res, req.params.userId, 'user');
    if (userId === null) return;

    try {
        const reviews = await reviewRepo.findByReviewee(userId);
        const averageRating = await reviewRepo.getAverageRating(userId);
        const reviewCount = await reviewRepo.getReviewCount(userId);

        return sendSuccess(res, {
            reviews,
            stats: {
                average_rating: averageRating ? Math.round(averageRating * 10) / 10 : null,
                review_count: reviewCount
            }
        });
    } catch (error) {
        console.error(`Error fetching reviews for user ${userId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred.');
    }
};

export const updateReview = async (req: Request, res: Response) => {
    const reviewId = parseIdParam(res, req.params.id, 'review');
    if (reviewId === null) return;

    try {
        const review = await reviewRepo.findById(reviewId);
        if (!review) {
            return sendError(res, 404, 'Review not found.');
        }

        const { rating, feedback } = req.body;
        const updated = await reviewRepo.update(reviewId, { rating, feedback });

        if (updated) {
            const updatedReview = await reviewRepo.findById(reviewId);
            return sendSuccess(res, updatedReview);
        } else {
            return sendError(res, 400, 'No valid fields to update.');
        }
    } catch (error) {
        console.error(`Error updating review ${reviewId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred.');
    }
};

export const deleteReview = async (req: Request, res: Response) => {
    const reviewId = parseIdParam(res, req.params.id, 'review');
    if (reviewId === null) return;

    try {
        await reviewRepo.deleteById(reviewId);
        return sendSuccess(res, { message: 'Review deleted.' });
    } catch (error) {
        console.error(`Error deleting review ${reviewId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred.');
    }
};

export const getUserRating = async (req: Request, res: Response) => {
    const userId = parseIdParam(res, req.params.userId, 'user');
    if (userId === null) return;

    try {
        const averageRating = await reviewRepo.getAverageRating(userId);
        const reviewCount = await reviewRepo.getReviewCount(userId);

        return sendSuccess(res, {
            average_rating: averageRating ? Math.round(averageRating * 10) / 10 : null,
            total_reviews: reviewCount
        });
    } catch (error) {
        console.error(`Error fetching rating for user ${userId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred.');
    }
};

export const checkHasReviewed = async (req: Request, res: Response) => {
    const jobId = parseIdParam(res, req.params.jobId, 'job');
    if (jobId === null) return;
    const reviewerId = parseIdParam(res, req.params.reviewerId, 'reviewer');
    if (reviewerId === null) return;

    try {
        const hasReviewed = await reviewRepo.hasReviewed(jobId, reviewerId);
        return sendSuccess(res, { hasReviewed });
    } catch (error) {
        console.error(`Error checking review status:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred.');
    }
};
