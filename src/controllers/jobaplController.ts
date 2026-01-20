import { Request, Response } from 'express';
import { jobAplRepo } from '../repositories/jobaplRepo.js';
import { jobRepo } from '../repositories/jobRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { JobApplicationStatus } from '../interfaces/jobapl.js';
import { parseIdParam, rethrowHttpError, sendError, sendSuccess } from '../utils/http.js';

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

        // Check if job is still open for applications
        if (job.status !== 'Open') {
            return sendError(res, 400, 'This job is no longer accepting applications.');
        }

        const freelancerUser = await userRepo.findById(freelancer_id);
        if (!freelancerUser) {
            return sendError(res, 400, 'freelancer_id does not reference an existing user.');
        }

        // Check if freelancer already applied to this job
        const existingApplications = await jobAplRepo.findByJobId(job_id);
        const alreadyApplied = existingApplications.some(app => app.freelancer_id === freelancer_id);
        if (alreadyApplied) {
            return sendError(res, 400, 'You have already applied to this job.');
        }

        const newApplicationId = await jobAplRepo.create(job_id, freelancer_id, bid_amount, proposal_text, status);

        if (newApplicationId) {
            return sendSuccess(res, { application_id: newApplicationId }, 201);
        } else {
            return sendError(res, 500, 'Failed to create job application.');
        }

    } catch (error) {
        console.error('creation error:', error);
        rethrowHttpError(error, 500, 'An internal server error occurred during creation.');
    }
};

export const getAllJobApplications = async (req: Request, res: Response) => {
    try {
        const data = await jobAplRepo.get_all();

        return sendSuccess(res, data);
    } catch (error){
        console.error('Error fetching job applications', error);
        rethrowHttpError(error, 500, 'An internal server error occurred while fetching job applications.');
    }
};

export const getJobApplicationById = async (req: Request, res: Response) => {
    const applicationId = parseIdParam(res, req.params.id, 'application');
    if (applicationId === null) return;

    try {
        // Use findByIdWithDetails to get freelancer info for checkout page
        const application = await jobAplRepo.findByIdWithDetails(applicationId);

        if (!application) {
            return sendError(res, 404, 'Job application not found.');
        }

        return sendSuccess(res, application);

    } catch (error) {
        console.error(`Error fetching job application ${applicationId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while fetching the job application.');
    }
};

export const deleteJobApplication = async(req: Request, res: Response) => {
    const applicationId = parseIdParam(res, req.params.id, 'application');
    if (applicationId === null) return;

    try {
        await jobAplRepo.deleteByID(applicationId);
        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error deleting job application ${applicationId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while deleting the job application.');
    }
};

export const updateJobApplication = async (req: Request, res: Response) => {
    const applicationId = parseIdParam(res, req.params.id, 'application');
    const { job_id, freelancer_id, bid_amount, proposal_text, status } = req.body; 
    if (applicationId === null) return;

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
        rethrowHttpError(error, 500, 'An internal server error occurred while updating the job application.');
    }
};

export const getApplicationsByJobId = async (req: Request, res: Response) => {
    const jobId = parseIdParam(res, req.params.jobId, 'job');
    if (jobId === null) return;

    try {
        const applications = await jobAplRepo.findByJobId(jobId);
        return sendSuccess(res, applications);
    } catch (error) {
        console.error(`Error fetching applications for job ${jobId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while fetching applications.');
    }
};

export const getApplicationsByFreelancerId = async (req: Request, res: Response) => {
    const freelancerId = parseIdParam(res, req.params.freelancerId, 'freelancer');
    if (freelancerId === null) return;

    try {
        const applications = await jobAplRepo.findByFreelancerId(freelancerId);
        return sendSuccess(res, applications);
    } catch (error) {
        console.error(`Error fetching applications for freelancer ${freelancerId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while fetching applications.');
    }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
    const applicationId = parseIdParam(res, req.params.id, 'application');
    const { status } = req.body;
    if (applicationId === null) return;

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
            // When accepting an application, update job status to In Progress, create assignment, and reject other applications
            if (status === 'Accepted') {
                const { jobRepo } = await import('../repositories/jobRepo.js');
                const { assignmentRepo } = await import('../repositories/assignmentRepo.js');
                
                // Update job status
                await jobRepo.update(existingApplication.job_id, { status: 'In Progress' });
                
                // Create assignment for the accepted freelancer
                await assignmentRepo.create(existingApplication.job_id, existingApplication.freelancer_id);
                
                // Reject all other pending applications for this job
                const allApplications = await jobAplRepo.findByJobId(existingApplication.job_id);
                for (const app of allApplications) {
                    if (app.application_id !== applicationId && app.status === 'Pending') {
                        await jobAplRepo.update(app.application_id, { status: 'Rejected' });
                    }
                }
            }
            return sendSuccess(res, { message: `Application ${status.toLowerCase()} successfully.` });
        } else {
            return sendError(res, 500, 'Failed to update application status.');
        }
    } catch (error) {
        console.error(`Error updating application status ${applicationId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while updating application status.');
    }
};