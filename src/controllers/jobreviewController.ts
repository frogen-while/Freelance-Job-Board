import { Request, Response } from 'express';
import { jobReviewRepo } from '../repositories/jobreviewRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { jobRepo } from '../repositories/jobRepo.js';
import { rating } from '../interfaces/Jobreview.js';
import { sendError, sendSuccess } from '../utils/http.js';

export const createJobReview = async (req: Request, res: Response) => {
    const {job_id, reviewer_id, rating, feedback} = req.body;

    if (job_id === undefined || reviewer_id === undefined || rating === undefined || feedback === undefined) {
        return sendError(res, 400, 'job_id, reviewer_id, rating and feedback are required.');
    }

    if (![1, 2, 3, 4, 5].includes(rating)) {
        return sendError(res, 400, 'rating must be between 1 and 5.');
    }

    try {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return sendError(res, 400, 'job_id does not reference an existing job.');
        }

        const reviewer = await userRepo.findById(reviewer_id);
        if (!reviewer) {
            return sendError(res, 400, 'reviewer_id does not reference an existing user.');
        }

        const newReviewId = await jobReviewRepo.create(job_id, reviewer_id, rating, feedback);

        if (newReviewId) {
            return sendSuccess(res, { review_id: newReviewId }, 201);
        } else {
            return sendError(res, 500, 'Failed to create job review.');
        }

    } catch (error) {
        console.error('creation error:', error);
        return sendError(res, 500, 'An internal server error occurred during job review creation.');
    }
};

export const getAllJobReviews = async (req: Request, res: Response) => {
    try {
        const data = await jobReviewRepo.get_all()

        return sendSuccess(res, data);
    } catch (error){
        console.error('Error fetching job reviews', error)
        return sendError(res, 500, 'An internal server error occurred while fetching job reviews.');
    }
};

export const getJobReviewById = async (req: Request, res: Response) => {
    const reviewId = parseInt(req.params.id, 10); 

    if (isNaN(reviewId)) {
        return sendError(res, 400, 'Invalid review ID format.');
    }

    try {
        const review = await jobReviewRepo.findById(reviewId);

        if (!review) {
            return sendError(res, 404, 'Job review not found.');
        }

        return sendSuccess(res, review);

    } catch (error) {
        console.error(`Error fetching job review ${reviewId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while fetching the job review.');
    }
};

export const deleteJobReview = async(req: Request, res: Response) =>{
    const reviewId = parseInt(req.params.id, 10); 

    if (isNaN(reviewId)) {
        return sendError(res, 400, 'Invalid review ID format.');
    }

    try {
        await jobReviewRepo.deleteByID(reviewId)
        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error deleting job review ${reviewId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while deleting the job review.');
    }

};

export const updateJobReview = async (req: Request, res: Response) => {
    const reviewId = parseInt(req.params.id, 10);
    const { job_id, reviewer_id, rating, feedback} = req.body; 

    if (isNaN(reviewId)) {
        return sendError(res, 400, 'Invalid review ID format.');
    }

    const updateData: {job_id?: number, reviewer_id?: number, rating?: rating, feedback?: string} = {};
    
    if (job_id !== undefined) {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return sendError(res, 400, 'job_id does not reference an existing job.');
        }
        updateData.job_id = job_id;
    }
    if (reviewer_id !== undefined) {
        const reviewer = await userRepo.findById(reviewer_id);
        if (!reviewer) {
            return sendError(res, 400, 'reviewer_id does not reference an existing user.');
        }
        updateData.reviewer_id = reviewer_id;
    }
    if (rating !== undefined) {
        if (![1, 2, 3, 4, 5].includes(rating)) {
            return sendError(res, 400, 'rating must be between 1 and 5.');
        }
        updateData.rating = rating;
    }
    if (feedback !== undefined) updateData.feedback = feedback;

    if (Object.keys(updateData).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update (allowed: job_id, reviewer_id, rating, feedback)')
    }
    
    try {
        const existingReview = await jobReviewRepo.findById(reviewId);
        if (!existingReview) {
            return sendError(res, 404, 'Job review not found.');
        }
        
        const success = await jobReviewRepo.update(reviewId, updateData);

        if (success) {
            return sendSuccess(res, { message: 'Job review updated successfully.' });
        } else {
            return sendError(res, 500, 'Failed to update job review.');
        }
    } catch (error) {
        console.error(`Error updating job review ${reviewId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while updating the job review.');
    }
};