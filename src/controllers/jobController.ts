import { Request, Response } from 'express';
import { jobRepo } from '../repositories/jobRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { categoryRepo } from '../repositories/categoryRepo.js';
import { status } from '../interfaces/Job.js';

export const createJob = async (req: Request, res: Response) => {
    const {employer_id, category_id, title, description, budget, status, deadline} = req.body;

    if (employer_id === undefined || category_id === undefined || !title || description === undefined || budget === undefined || !status || !deadline) {
        return res.status(400).json({ error: 'employer_id, category_id, title, description, budget, status and deadline are required.' });
    }

    try {
        const employerUser = await userRepo.findById(employer_id);
        if (!employerUser) {
            return res.status(400).json({ error: 'employer_id does not reference an existing user.' });
        }

        const category = await categoryRepo.findById(category_id);
        if (!category) {
            return res.status(400).json({ error: 'category_id does not reference an existing category.' });
        }

        const newJobId = await jobRepo.create(employer_id, category_id, title, description, budget, status, deadline);

        if (newJobId) {
            return res.status(201).json({ 
                message: 'Job successfully created.', 
                job_id: newJobId,
                description: description
            });
        } else {
            return res.status(500).json({ error: 'Failed to create job.' });
        }

    } catch (error) {
        console.error('creation error:', error);
        return res.status(500).json({ error: 'An internal server error occurred during registration.' });
    }
};

export const getAllJobs = async (req: Request, res: Response) => {
    try {
        const data = await jobRepo.get_all()

        return res.status(200).json(
        {
            data
        });
    } catch (error){
        console.error('Error fetching Jobs', error)
        return res.status(500).json({ error: 'An internal server error occurred while fetching categories.' });
    }
};

export const getJobById = async (req: Request, res: Response) => {
    const JobId = parseInt(req.params.id, 10); 

    if (isNaN(JobId)) {
        return res.status(400).json({ error: 'Invalid job ID format.' });
    }

    try {
        const job = await jobRepo.findById(JobId);

        if (!job) {
            return res.status(404).json({ error: 'job not found.' });
        }

        return res.status(200).json({ data: job });

    } catch (error) {
        console.error(`Error fetching job ${JobId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while fetching the category.' });
    }
};

export const deleteJob = async(req: Request, res: Response) =>{
    const JobId = parseInt(req.params.id, 10); 

    if (isNaN(JobId)) {
        return res.status(400).json({ error: 'Invalid job ID format.' });
    }

    try {
        await jobRepo.deleteByID(JobId)
        return res.status(204).send();
    } catch (error) {
        console.error(`Error fetching job ${JobId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while deleting the category.' });
    }

};

export const updateJob = async (req: Request, res: Response) => {
    const JobId = parseInt(req.params.id, 10);
    const { employer_id, category_id, title, description, budget, status, deadline} = req.body; 

    if (isNaN(JobId)) {
        return res.status(400).json({ error: 'Invalid job ID format.' });
    }

    const updateData: {employer_id?: number, category_id?: number, title?: string, description?: string, budget?: number, status?: status, deadline?: Date} = {};
    if (employer_id !== undefined) {
        const employerUser = await userRepo.findById(employer_id);
        if (!employerUser) {
            return res.status(400).json({ error: 'employer_id does not reference an existing user.' });
        }
        updateData.employer_id = employer_id;
    }
    if (category_id !== undefined) {
        const category = await categoryRepo.findById(category_id);
        if (!category) {
            return res.status(400).json({ error: 'category_id does not reference an existing category.' });
        }
        updateData.category_id = category_id;
    }
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (budget !== undefined) updateData.budget = budget;
    if (status !== undefined) updateData.status = status;
    if (deadline !== undefined) updateData.deadline = deadline;

        if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update (allowed: job_id, employer_id, category_id, title, description, budget, status, deadline' })
    }
    try {
        const existingJob = await jobRepo.findById(JobId);
        if (!existingJob) {
            return res.status(404).json({ error: 'job not found.' });
        }
        
        const success = await jobRepo.update(JobId, updateData);

        if (success) {
            return res.status(200).json({ message: 'job updated successfully.' });
        } else {
            return res.status(500).json({ error: 'Failed to update job.' });
        }
    } catch (error) {
        console.error(`Error updating job ${JobId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while updating the category.' });
    }
};