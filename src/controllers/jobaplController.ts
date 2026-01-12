import { Request, Response } from 'express';
import { jobAplRepo } from '../repositories/jobaplRepo.js';
import { jobRepo } from '../repositories/jobRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { JobApplicationStatus } from '../interfaces/jobapl.js';
import { sendError, sendSuccess } from '../utils/http.js';

export const createJobApplication = async (req: Request, res: Response) => {
    const {job_id, freelancer_id, bid_amount, proposal_text, status} = req.body;

    if (job_id === undefined || freelancer_id === undefined || bid_amount === undefined || proposal_text === undefined || !status) {
        return sendError(res, 400, 'job_id, freelancer_id, bid_amount, proposal_text and status are required.');
    }

    try {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return sendError(res, 400, 'job_id does not reference an existing job.');
        }

        const freelancerUser = await userRepo.findById(freelancer_id);
        if (!freelancerUser) {
            return sendError(res, 400, 'freelancer_id does not reference an existing user.');
        }

        const newApplicationId = await jobAplRepo.create(job_id, freelancer_id, bid_amount, proposal_text, status);

        if (newApplicationId) {
            return sendSuccess(res, { application_id: newApplicationId }, 201);
        } else {
            return sendError(res, 500, 'Failed to create job application.');
        }

    } catch (error) {
        console.error('creation error:', error);
        return sendError(res, 500, 'An internal server error occurred during creation.');
    }
};

export const getAllJobApplications = async (req: Request, res: Response) => {
    try {
        const data = await jobAplRepo.get_all();

        return sendSuccess(res, data);
    } catch (error){
        console.error('Error fetching job applications', error);
        return sendError(res, 500, 'An internal server error occurred while fetching job applications.');
    }
};

export const getJobApplicationById = async (req: Request, res: Response) => {
    const applicationId = parseInt(req.params.id, 10); 

    if (isNaN(applicationId)) {
        return sendError(res, 400, 'Invalid application ID format.');
    }

    try {
        const application = await jobAplRepo.findById(applicationId);

        if (!application) {
            return sendError(res, 404, 'Job application not found.');
        }

        return sendSuccess(res, application);

    } catch (error) {
        console.error(`Error fetching job application ${applicationId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while fetching the job application.');
    }
};

export const deleteJobApplication = async(req: Request, res: Response) => {
    const applicationId = parseInt(req.params.id, 10); 

    if (isNaN(applicationId)) {
        return sendError(res, 400, 'Invalid application ID format.');
    }

    try {
        await jobAplRepo.deleteByID(applicationId);
        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error deleting job application ${applicationId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while deleting the job application.');
    }
};

export const updateJobApplication = async (req: Request, res: Response) => {
    const applicationId = parseInt(req.params.id, 10);
    const { job_id, freelancer_id, bid_amount, proposal_text, status } = req.body; 

    if (isNaN(applicationId)) {
        return sendError(res, 400, 'Invalid application ID format.');
    }

    const updateData: {job_id?: number, freelancer_id?: number, bid_amount?: number, proposal_text?: string, status?: JobApplicationStatus} = {};
    
    if (job_id !== undefined) {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return sendError(res, 400, 'job_id does not reference an existing job.');
        }
        updateData.job_id = job_id;
    }
    if (freelancer_id !== undefined) {
        const freelancerUser = await userRepo.findById(freelancer_id);
        if (!freelancerUser) {
            return sendError(res, 400, 'freelancer_id does not reference an existing user.');
        }
        updateData.freelancer_id = freelancer_id;
    }
    if (bid_amount !== undefined) updateData.bid_amount = bid_amount;
    if (proposal_text !== undefined) updateData.proposal_text = proposal_text;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update (allowed: job_id, freelancer_id, bid_amount, proposal_text, status)');
    }
    
    try {
        const existingApplication = await jobAplRepo.findById(applicationId);
        if (!existingApplication) {
            return sendError(res, 404, 'Job application not found.');
        }
        
        const success = await jobAplRepo.update(applicationId, updateData);

        if (success) {
            return sendSuccess(res, { message: 'Job application updated successfully.' });
        } else {
            return sendError(res, 500, 'Failed to update job application.');
        }
    } catch (error) {
        console.error(`Error updating job application ${applicationId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while updating the job application.');
    }
};

export const getApplicationsByJobId = async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.jobId, 10);

    if (isNaN(jobId)) {
        return sendError(res, 400, 'Invalid job ID format.');
    }

    try {
        const applications = await jobAplRepo.findByJobId(jobId);
        return sendSuccess(res, applications);
    } catch (error) {
        console.error(`Error fetching applications for job ${jobId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while fetching applications.');
    }
};

export const getApplicationsByFreelancerId = async (req: Request, res: Response) => {
    const freelancerId = parseInt(req.params.freelancerId, 10);

    if (isNaN(freelancerId)) {
        return sendError(res, 400, 'Invalid freelancer ID format.');
    }

    try {
        const applications = await jobAplRepo.findByFreelancerId(freelancerId);
        return sendSuccess(res, applications);
    } catch (error) {
        console.error(`Error fetching applications for freelancer ${freelancerId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while fetching applications.');
    }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
    const applicationId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(applicationId)) {
        return sendError(res, 400, 'Invalid application ID format.');
    }

    if (!status || !['Pending', 'Accepted', 'Rejected'].includes(status)) {
        return sendError(res, 400, 'Valid status is required (Pending, Accepted, Rejected).');
    }

    try {
        const existingApplication = await jobAplRepo.findById(applicationId);
        if (!existingApplication) {
            return sendError(res, 404, 'Job application not found.');
        }

        const success = await jobAplRepo.update(applicationId, { status });

        if (success) {
            return sendSuccess(res, { message: `Application ${status.toLowerCase()} successfully.` });
        } else {
            return sendError(res, 500, 'Failed to update application status.');
        }
    } catch (error) {
        console.error(`Error updating application status ${applicationId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while updating application status.');
    }
};