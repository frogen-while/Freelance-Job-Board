import { Request, Response } from 'express';
import { jobRepo } from '../repositories/jobRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { categoryRepo } from '../repositories/categoryRepo.js';
import { JobStatus } from '../interfaces/Job.js';
import { sendError, sendSuccess } from '../utils/http.js';

export const createJob = async (req: Request, res: Response) => {
    const {employer_id, category_id, title, description, budget, status, deadline} = req.body;

    if (employer_id === undefined || category_id === undefined || !title || description === undefined || budget === undefined || !status || !deadline) {
        return sendError(res, 400, 'employer_id, category_id, title, description, budget, status and deadline are required.');
    }

    try {
        const employerUser = await userRepo.findById(employer_id);
        if (!employerUser) {
            return sendError(res, 400, 'employer_id does not reference an existing user.');
        }

        const category = await categoryRepo.findById(category_id);
        if (!category) {
            return sendError(res, 400, 'category_id does not reference an existing category.');
        }

        const newJobId = await jobRepo.create(employer_id, category_id, title, description, budget, status, deadline);

        if (newJobId) {
            return sendSuccess(res, { job_id: newJobId }, 201);
        } else {
            return sendError(res, 500, 'Failed to create job.');
        }

    } catch (error) {
        console.error('Error creating job:', error);
        return sendError(res, 500, 'An internal server error occurred during job creation.');
    }
};

export const getAllJobs = async (req: Request, res: Response) => {
    try {
        const data = await jobRepo.get_all()

        return sendSuccess(res, data);
    } catch (error){
        console.error('Error fetching jobs:', error);
        return sendError(res, 500, 'An internal server error occurred while fetching jobs.');
    }
};

export const getJobById = async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.id, 10);

    if (isNaN(jobId)) {
        return sendError(res, 400, 'Invalid job ID format.');
    }

    try {
        const job = await jobRepo.findById(jobId);

        if (!job) {
            return sendError(res, 404, 'Job not found.');
        }

        return sendSuccess(res, job);

    } catch (error) {
        console.error(`Error fetching job ${jobId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while fetching the job.');
    }
};

export const deleteJob = async(req: Request, res: Response) =>{
    const jobId = parseInt(req.params.id, 10);

    if (isNaN(jobId)) {
        return sendError(res, 400, 'Invalid job ID format.');
    }

    try {
        await jobRepo.deleteByID(jobId);
        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error deleting job ${jobId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while deleting the job.');
    }

};

export const updateJob = async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.id, 10);
    const { employer_id, category_id, title, description, budget, status, deadline} = req.body; 

    if (isNaN(jobId)) {
        return sendError(res, 400, 'Invalid job ID format.');
    }

    const updateData: {employer_id?: number, category_id?: number, title?: string, description?: string, budget?: number, status?: JobStatus, deadline?: string} = {};
    if (employer_id !== undefined) {
        const employerUser = await userRepo.findById(employer_id);
        if (!employerUser) {
            return sendError(res, 400, 'employer_id does not reference an existing user.');
        }
        updateData.employer_id = employer_id;
    }
    if (category_id !== undefined) {
        const category = await categoryRepo.findById(category_id);
        if (!category) {
            return sendError(res, 400, 'category_id does not reference an existing category.');
        }
        updateData.category_id = category_id;
    }
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (budget !== undefined) updateData.budget = budget;
    if (status !== undefined) updateData.status = status;
    if (deadline !== undefined) {
        if (typeof deadline !== 'string') {
            return sendError(res, 400, 'deadline must be a string.');
        }
        updateData.deadline = deadline;
    }

    if (Object.keys(updateData).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update (allowed: employer_id, category_id, title, description, budget, status, deadline)');
    }
    try {
        const existingJob = await jobRepo.findById(jobId);
        if (!existingJob) {
            return sendError(res, 404, 'Job not found.');
        }
        
        const success = await jobRepo.update(jobId, updateData);

        if (success) {
            return sendSuccess(res, { message: 'Job updated successfully.' });
        } else {
            return sendError(res, 500, 'Failed to update job.');
        }
    } catch (error) {
        console.error(`Error updating job ${jobId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while updating the job.');
    }
};