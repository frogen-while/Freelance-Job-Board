import { Request, Response } from 'express';
import { jobRepo } from '../repositories/jobRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { categoryRepo } from '../repositories/categoryRepo.js';
import { employerProfilesRepo } from '../repositories/employerProfilesRepo.js';
import { JobStatus, ExperienceLevel, JobType, DurationEstimate } from '../interfaces/Job.js';
import { sendError, sendSuccess } from '../utils/http.js';

export const createJob = async (req: Request, res: Response) => {
    const {
        employer_id, category_id, title, description, budget, status, deadline,
        experience_level, job_type, duration_estimate, is_remote, location, skill_ids
    } = req.body;

    if (employer_id === undefined || category_id === undefined || !title || description === undefined || budget === undefined) {
        return sendError(res, 400, 'employer_id, category_id, title, description and budget are required.');
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

        const newJobId = await jobRepo.create({
            employer_id,
            category_id,
            title,
            description,
            budget,
            status: status || 'Open',
            deadline,
            experience_level,
            job_type,
            duration_estimate,
            is_remote,
            location,
            skill_ids
        });

        if (newJobId) {
            // Increment employer's jobs_posted count
            await employerProfilesRepo.incrementJobsPosted(employer_id);
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
        // Check for query parameters for filtering
        const { 
            q, category, status, experience_level, job_type, is_remote, skills, limit, offset 
        } = req.query;

        if (q || category || status || experience_level || job_type || is_remote !== undefined || skills) {
            // Use search with filters
            const result = await jobRepo.search({
                query: q as string,
                category_id: category ? parseInt(category as string, 10) : undefined,
                status: status as JobStatus,
                experience_level: experience_level as ExperienceLevel,
                job_type: job_type as JobType,
                is_remote: is_remote === 'true' ? true : is_remote === 'false' ? false : undefined,
                skill_ids: skills ? (skills as string).split(',').map(Number) : undefined,
                limit: limit ? parseInt(limit as string, 10) : 20,
                offset: offset ? parseInt(offset as string, 10) : 0
            });
            return sendSuccess(res, result);
        }

        // Default: get all jobs with skills
        const data = await jobRepo.getAllWithSkills();
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
    const { 
        employer_id, category_id, title, description, budget, status, deadline,
        experience_level, job_type, duration_estimate, is_remote, location, skill_ids
    } = req.body; 

    if (isNaN(jobId)) {
        return sendError(res, 400, 'Invalid job ID format.');
    }

    const updateData: {
        employer_id?: number;
        category_id?: number;
        title?: string;
        description?: string;
        budget?: number;
        status?: JobStatus;
        deadline?: string;
        experience_level?: ExperienceLevel;
        job_type?: JobType;
        duration_estimate?: DurationEstimate;
        is_remote?: boolean;
        location?: string;
        skill_ids?: number[];
    } = {};

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
    if (deadline !== undefined) updateData.deadline = deadline;
    if (experience_level !== undefined) updateData.experience_level = experience_level;
    if (job_type !== undefined) updateData.job_type = job_type;
    if (duration_estimate !== undefined) updateData.duration_estimate = duration_estimate;
    if (is_remote !== undefined) updateData.is_remote = is_remote;
    if (location !== undefined) updateData.location = location;
    if (skill_ids !== undefined) updateData.skill_ids = skill_ids;

    if (Object.keys(updateData).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update.');
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