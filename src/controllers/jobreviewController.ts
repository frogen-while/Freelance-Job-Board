import { Request, Response } from 'express';
import { jobAplRepo } from '../repositories/jobreviewRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { jobRepo } from '../repositories/jobRepo.js';
import { rating } from '../interfaces/Jobreview.js';

export const createJobReview = async (req: Request, res: Response) => {
    const {job_id, reviewer_id, rating, feedback} = req.body;

    if (job_id === undefined || reviewer_id === undefined || rating === undefined || feedback === undefined) {
        return res.status(400).json({ error: 'job_id, reviewer_id, rating and feedback are required.' });
    }

    if (![1, 2, 3, 4, 5].includes(rating)) {
        return res.status(400).json({ error: 'rating must be between 1 and 5.' });
    }

    try {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return res.status(400).json({ error: 'job_id does not reference an existing job.' });
        }

        const reviewer = await userRepo.findById(reviewer_id);
        if (!reviewer) {
            return res.status(400).json({ error: 'reviewer_id does not reference an existing user.' });
        }

        const newReviewId = await jobAplRepo.create(job_id, reviewer_id, rating, feedback);

        if (newReviewId) {
            return res.status(201).json({ 
                message: 'Job review successfully created.', 
                review_id: newReviewId,
                feedback: feedback
            });
        } else {
            return res.status(500).json({ error: 'Failed to create job review.' });
        }

    } catch (error) {
        console.error('creation error:', error);
        return res.status(500).json({ error: 'An internal server error occurred during job review creation.' });
    }
};

export const getAllJobReviews = async (req: Request, res: Response) => {
    try {
        const data = await jobAplRepo.get_all()

        return res.status(200).json(
        {
            data
        });
    } catch (error){
        console.error('Error fetching job reviews', error)
        return res.status(500).json({ error: 'An internal server error occurred while fetching job reviews.' });
    }
};

export const getJobReviewById = async (req: Request, res: Response) => {
    const reviewId = parseInt(req.params.id, 10); 

    if (isNaN(reviewId)) {
        return res.status(400).json({ error: 'Invalid review ID format.' });
    }

    try {
        const review = await jobAplRepo.findById(reviewId);

        if (!review) {
            return res.status(404).json({ error: 'job review not found.' });
        }

        return res.status(200).json({ data: review });

    } catch (error) {
        console.error(`Error fetching job review ${reviewId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while fetching the job review.' });
    }
};

export const deleteJobReview = async(req: Request, res: Response) =>{
    const reviewId = parseInt(req.params.id, 10); 

    if (isNaN(reviewId)) {
        return res.status(400).json({ error: 'Invalid review ID format.' });
    }

    try {
        await jobAplRepo.deleteByID(reviewId)
        return res.status(204).send();
    } catch (error) {
        console.error(`Error deleting job review ${reviewId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while deleting the job review.' });
    }

};

export const updateJobReview = async (req: Request, res: Response) => {
    const reviewId = parseInt(req.params.id, 10);
    const { job_id, reviewer_id, rating, feedback} = req.body; 

    if (isNaN(reviewId)) {
        return res.status(400).json({ error: 'Invalid review ID format.' });
    }

    const updateData: {job_id?: number, reviewer_id?: number, rating?: rating, feedback?: string} = {};
    
    if (job_id !== undefined) {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return res.status(400).json({ error: 'job_id does not reference an existing job.' });
        }
        updateData.job_id = job_id;
    }
    if (reviewer_id !== undefined) {
        const reviewer = await userRepo.findById(reviewer_id);
        if (!reviewer) {
            return res.status(400).json({ error: 'reviewer_id does not reference an existing user.' });
        }
        updateData.reviewer_id = reviewer_id;
    }
    if (rating !== undefined) {
        if (![1, 2, 3, 4, 5].includes(rating)) {
            return res.status(400).json({ error: 'rating must be between 1 and 5.' });
        }
        updateData.rating = rating;
    }
    if (feedback !== undefined) updateData.feedback = feedback;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update (allowed: job_id, reviewer_id, rating, feedback)' })
    }
    
    try {
        const existingReview = await jobAplRepo.findById(reviewId);
        if (!existingReview) {
            return res.status(404).json({ error: 'job review not found.' });
        }
        
        const success = await jobAplRepo.update(reviewId, updateData);

        if (success) {
            return res.status(200).json({ message: 'job review updated successfully.' });
        } else {
            return res.status(500).json({ error: 'Failed to update job review.' });
        }
    } catch (error) {
        console.error(`Error updating job review ${reviewId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while updating the job review.' });
    }
};