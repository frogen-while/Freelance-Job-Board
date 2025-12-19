import { Request, Response } from 'express';
import { assignmentRepo } from '../repositories/assignmentRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { jobRepo } from '../repositories/jobRepo.js';
import { status } from '../interfaces/Assignment.js';

export const createAssignment = async (req: Request, res: Response) => {
    const {job_id, freelancer_id, status} = req.body;

    if (job_id === undefined || freelancer_id === undefined || !status) {
        return res.status(400).json({ error: 'job_id, freelancer_id and status are required.' });
    }

    if (!['Active', 'Completed', 'Terminated'].includes(status)) {
        return res.status(400).json({ error: 'status must be Active, Completed, or Terminated.' });
    }

    try {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return res.status(400).json({ error: 'job_id does not reference an existing job.' });
        }

        const freelancer = await userRepo.findById(freelancer_id);
        if (!freelancer) {
            return res.status(400).json({ error: 'freelancer_id does not reference an existing user.' });
        }

        const newAssignmentId = await assignmentRepo.create(job_id, freelancer_id, status);

        if (newAssignmentId) {
            return res.status(201).json({ 
                message: 'Assignment successfully created.', 
                assignment_id: newAssignmentId,
                status: status
            });
        } else {
            return res.status(500).json({ error: 'Failed to create assignment.' });
        }

    } catch (error) {
        console.error('creation error:', error);
        return res.status(500).json({ error: 'An internal server error occurred during assignment creation.' });
    }
};

export const getAllAssignments = async (req: Request, res: Response) => {
    try {
        const data = await assignmentRepo.get_all()

        return res.status(200).json(
        {
            data
        });
    } catch (error){
        console.error('Error fetching assignments', error)
        return res.status(500).json({ error: 'An internal server error occurred while fetching assignments.' });
    }
};

export const getAssignmentById = async (req: Request, res: Response) => {
    const assignmentId = parseInt(req.params.id, 10); 

    if (isNaN(assignmentId)) {
        return res.status(400).json({ error: 'Invalid assignment ID format.' });
    }

    try {
        const assignment = await assignmentRepo.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({ error: 'assignment not found.' });
        }

        return res.status(200).json({ data: assignment });

    } catch (error) {
        console.error(`Error fetching assignment ${assignmentId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while fetching the assignment.' });
    }
};

export const deleteAssignment = async(req: Request, res: Response) =>{
    const assignmentId = parseInt(req.params.id, 10); 

    if (isNaN(assignmentId)) {
        return res.status(400).json({ error: 'Invalid assignment ID format.' });
    }

    try {
        await assignmentRepo.deleteByID(assignmentId)
        return res.status(204).send();
    } catch (error) {
        console.error(`Error deleting assignment ${assignmentId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while deleting the assignment.' });
    }

};

export const updateAssignment = async (req: Request, res: Response) => {
    const assignmentId = parseInt(req.params.id, 10);
    const { job_id, freelancer_id, status} = req.body; 

    if (isNaN(assignmentId)) {
        return res.status(400).json({ error: 'Invalid assignment ID format.' });
    }

    const updateData: {job_id?: number, freelancer_id?: number, status?: status} = {};
    
    if (job_id !== undefined) {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return res.status(400).json({ error: 'job_id does not reference an existing job.' });
        }
        updateData.job_id = job_id;
    }
    if (freelancer_id !== undefined) {
        const freelancer = await userRepo.findById(freelancer_id);
        if (!freelancer) {
            return res.status(400).json({ error: 'freelancer_id does not reference an existing user.' });
        }
        updateData.freelancer_id = freelancer_id;
    }
    if (status !== undefined) {
        if (!['Active', 'Completed', 'Terminated'].includes(status)) {
            return res.status(400).json({ error: 'status must be Active, Completed, or Terminated.' });
        }
        updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update (allowed: job_id, freelancer_id, status)' })
    }
    
    try {
        const existingAssignment = await assignmentRepo.findById(assignmentId);
        if (!existingAssignment) {
            return res.status(404).json({ error: 'assignment not found.' });
        }
        
        const success = await assignmentRepo.update(assignmentId, updateData);

        if (success) {
            return res.status(200).json({ message: 'assignment updated successfully.' });
        } else {
            return res.status(500).json({ error: 'Failed to update assignment.' });
        }
    } catch (error) {
        console.error(`Error updating assignment ${assignmentId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while updating the assignment.' });
    }
};