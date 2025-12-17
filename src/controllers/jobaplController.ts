import { Request, Response } from 'express';
import { jobAplRepo } from '../repositories/jobaplRepo.js';
import { jobRepo } from '../repositories/jobRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { status } from '../interfaces/jobapl.js';

export const createJobApplication = async (req: Request, res: Response) => {
    const {job_id, freelancer_id, bid_amount, proposal_text, status} = req.body;

    if (job_id === undefined || freelancer_id === undefined || bid_amount === undefined || proposal_text === undefined || !status) {
        return res.status(400).json({ error: 'job_id, freelancer_id, bid_amount, proposal_text and status are required.' });
    }

    try {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return res.status(400).json({ error: 'job_id does not reference an existing job.' });
        }

        const freelancerUser = await userRepo.findById(freelancer_id);
        if (!freelancerUser) {
            return res.status(400).json({ error: 'freelancer_id does not reference an existing user.' });
        }

        const newApplicationId = await jobAplRepo.create(job_id, freelancer_id, bid_amount, proposal_text, status);

        if (newApplicationId) {
            return res.status(201).json({ 
                message: 'Job application successfully created.', 
                application_id: newApplicationId
            });
        } else {
            return res.status(500).json({ error: 'Failed to create job application.' });
        }

    } catch (error) {
        console.error('creation error:', error);
        return res.status(500).json({ error: 'An internal server error occurred during creation.' });
    }
};

export const getAllJobApplications = async (req: Request, res: Response) => {
    try {
        const data = await jobAplRepo.get_all();

        return res.status(200).json({
            data
        });
    } catch (error){
        console.error('Error fetching job applications', error);
        return res.status(500).json({ error: 'An internal server error occurred while fetching job applications.' });
    }
};

export const getJobApplicationById = async (req: Request, res: Response) => {
    const applicationId = parseInt(req.params.id, 10); 

    if (isNaN(applicationId)) {
        return res.status(400).json({ error: 'Invalid application ID format.' });
    }

    try {
        const application = await jobAplRepo.findById(applicationId);

        if (!application) {
            return res.status(404).json({ error: 'Job application not found.' });
        }

        return res.status(200).json({ data: application });

    } catch (error) {
        console.error(`Error fetching job application ${applicationId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while fetching the job application.' });
    }
};

export const deleteJobApplication = async(req: Request, res: Response) => {
    const applicationId = parseInt(req.params.id, 10); 

    if (isNaN(applicationId)) {
        return res.status(400).json({ error: 'Invalid application ID format.' });
    }

    try {
        await jobAplRepo.deleteByID(applicationId);
        return res.status(204).send();
    } catch (error) {
        console.error(`Error deleting job application ${applicationId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while deleting the job application.' });
    }
};

export const updateJobApplication = async (req: Request, res: Response) => {
    const applicationId = parseInt(req.params.id, 10);
    const { job_id, freelancer_id, bid_amount, proposal_text, status } = req.body; 

    if (isNaN(applicationId)) {
        return res.status(400).json({ error: 'Invalid application ID format.' });
    }

    const updateData: {job_id?: number, freelancer_id?: number, bid_amount?: number, proposal_text?: string, status?: status} = {};
    
    if (job_id !== undefined) {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return res.status(400).json({ error: 'job_id does not reference an existing job.' });
        }
        updateData.job_id = job_id;
    }
    if (freelancer_id !== undefined) {
        const freelancerUser = await userRepo.findById(freelancer_id);
        if (!freelancerUser) {
            return res.status(400).json({ error: 'freelancer_id does not reference an existing user.' });
        }
        updateData.freelancer_id = freelancer_id;
    }
    if (bid_amount !== undefined) updateData.bid_amount = bid_amount;
    if (proposal_text !== undefined) updateData.proposal_text = proposal_text;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update (allowed: job_id, freelancer_id, bid_amount, proposal_text, status)' });
    }
    
    try {
        const existingApplication = await jobAplRepo.findById(applicationId);
        if (!existingApplication) {
            return res.status(404).json({ error: 'Job application not found.' });
        }
        
        const success = await jobAplRepo.update(applicationId, updateData);

        if (success) {
            return res.status(200).json({ message: 'Job application updated successfully.' });
        } else {
            return res.status(500).json({ error: 'Failed to update job application.' });
        }
    } catch (error) {
        console.error(`Error updating job application ${applicationId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while updating the job application.' });
    }
};