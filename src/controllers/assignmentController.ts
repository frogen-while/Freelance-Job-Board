import { Request, Response } from 'express';
import { assignmentRepo } from '../repositories/assignmentRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { jobRepo } from '../repositories/jobRepo.js';
import { status } from '../interfaces/Assignment.js';
    import { sendError, sendSuccess } from '../utils/http.js';

export const createAssignment = async (req: Request, res: Response) => {
    const {job_id, freelancer_id, status} = req.body;

    if (job_id === undefined || freelancer_id === undefined || !status) {
        return sendError(res, 400, 'job_id, freelancer_id and status are required.');
    }

    if (!['Active', 'Completed', 'Terminated'].includes(status)) {
        return sendError(res, 400, 'status must be Active, Completed, or Terminated.');
    }

    try {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return sendError(res, 400, 'job_id does not reference an existing job.');
        }

        const freelancer = await userRepo.findById(freelancer_id);
        if (!freelancer) {
            return sendError(res, 400, 'freelancer_id does not reference an existing user.');
        }

        const newAssignmentId = await assignmentRepo.create(job_id, freelancer_id, status);

        if (newAssignmentId) {
            return sendSuccess(res, { assignment_id: newAssignmentId }, 201);
        } else {
            return sendError(res, 500, 'Failed to create assignment.');
        }

    } catch (error) {
        console.error('creation error:', error);
        return sendError(res, 500, 'An internal server error occurred during assignment creation.');
    }
};

export const getAllAssignments = async (req: Request, res: Response) => {
    try {
        const data = await assignmentRepo.get_all()

        return sendSuccess(res, data);
    } catch (error){
        console.error('Error fetching assignments', error)
        return sendError(res, 500, 'An internal server error occurred while fetching assignments.');
    }
};

export const getAssignmentById = async (req: Request, res: Response) => {
    const assignmentId = parseInt(req.params.id, 10); 

    if (isNaN(assignmentId)) {
        return sendError(res, 400, 'Invalid assignment ID format.');
    }

    try {
        const assignment = await assignmentRepo.findById(assignmentId);

        if (!assignment) {
            return sendError(res, 404, 'Assignment not found.');
        }

        return sendSuccess(res, assignment);

    } catch (error) {
        console.error(`Error fetching assignment ${assignmentId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while fetching the assignment.');
    }
};

export const deleteAssignment = async(req: Request, res: Response) =>{
    const assignmentId = parseInt(req.params.id, 10); 

    if (isNaN(assignmentId)) {
        return sendError(res, 400, 'Invalid assignment ID format.');
    }

    try {
        await assignmentRepo.deleteByID(assignmentId)
        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error deleting assignment ${assignmentId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while deleting the assignment.');
    }

};

export const updateAssignment = async (req: Request, res: Response) => {
    const assignmentId = parseInt(req.params.id, 10);
    const { job_id, freelancer_id, status} = req.body; 

    if (isNaN(assignmentId)) {
        return sendError(res, 400, 'Invalid assignment ID format.');
    }

    const updateData: {job_id?: number, freelancer_id?: number, status?: status} = {};
    
    if (job_id !== undefined) {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return sendError(res, 400, 'job_id does not reference an existing job.');
        }
        updateData.job_id = job_id;
    }
    if (freelancer_id !== undefined) {
        const freelancer = await userRepo.findById(freelancer_id);
        if (!freelancer) {
            return sendError(res, 400, 'freelancer_id does not reference an existing user.');
        }
        updateData.freelancer_id = freelancer_id;
    }
    if (status !== undefined) {
        if (!['Active', 'Completed', 'Terminated'].includes(status)) {
            return sendError(res, 400, 'status must be Active, Completed, or Terminated.');
        }
        updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update (allowed: job_id, freelancer_id, status)')
    }
    
    try {
        const existingAssignment = await assignmentRepo.findById(assignmentId);
        if (!existingAssignment) {
            return sendError(res, 404, 'Assignment not found.');
        }
        
        const success = await assignmentRepo.update(assignmentId, updateData);

        if (success) {
            return sendSuccess(res, { message: 'assignment updated successfully.' });
        } else {
            return sendError(res, 500, 'Failed to update assignment.');
        }
    } catch (error) {
        console.error(`Error updating assignment ${assignmentId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while updating the assignment.');
    }
};