import { Request, Response } from 'express';
import formidable, { File } from 'formidable';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { assignmentRepo } from '../repositories/assignmentRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { jobRepo } from '../repositories/jobRepo.js';
import { jobAplRepo } from '../repositories/jobaplRepo.js';
import { assignmentDeliverablesRepo } from '../repositories/assignmentDeliverablesRepo.js';
import { reviewRepo } from '../repositories/reviewRepo.js';
import { messageRepo } from '../repositories/messageRepo.js';
import { parseIdParam, rethrowHttpError, sendError, sendSuccess } from '../utils/http.js';

export const createAssignment = async (req: Request, res: Response) => {
    const {job_id, freelancer_id} = req.body;

    if (job_id === undefined || freelancer_id === undefined) {
        return sendError(res, 400, 'job_id and freelancer_id are required.');
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

        const newAssignmentId = await assignmentRepo.create(job_id, freelancer_id);

        if (newAssignmentId) {
            return sendSuccess(res, { assignment_id: newAssignmentId }, 201);
        } else {
            return sendError(res, 500, 'Failed to create assignment.');
        }

    } catch (error) {
        console.error('creation error:', error);
        rethrowHttpError(error, 500, 'An internal server error occurred during assignment creation.');
    }
};

export const getAllAssignments = async (req: Request, res: Response) => {
    try {
        const data = await assignmentRepo.get_all()

        return sendSuccess(res, data);
    } catch (error){
        console.error('Error fetching assignments', error)
        rethrowHttpError(error, 500, 'An internal server error occurred while fetching assignments.');
    }
};

export const getAssignmentById = async (req: Request, res: Response) => {
    const assignmentId = parseIdParam(res, req.params.id, 'assignment');
    if (assignmentId === null) {
        return;
    }

    try {
        const assignment = await assignmentRepo.findById(assignmentId);

        if (!assignment) {
            return sendError(res, 404, 'Assignment not found.');
        }

        return sendSuccess(res, assignment);

    } catch (error) {
        console.error(`Error fetching assignment ${assignmentId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while fetching the assignment.');
    }
};

export const deleteAssignment = async(req: Request, res: Response) =>{
    const assignmentId = parseIdParam(res, req.params.id, 'assignment');
    if (assignmentId === null) {
        return;
    }

    try {
        await assignmentRepo.deleteByID(assignmentId)
        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error deleting assignment ${assignmentId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while deleting the assignment.');
    }

};

export const updateAssignment = async (req: Request, res: Response) => {
    const assignmentId = parseIdParam(res, req.params.id, 'assignment');
    const { job_id, freelancer_id } = req.body;
    if (assignmentId === null) {
        return;
    }

    const updateData: {job_id?: number, freelancer_id?: number} = {};

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

    if (Object.keys(updateData).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update (allowed: job_id, freelancer_id)')
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
        rethrowHttpError(error, 500, 'An internal server error occurred while updating the assignment.');
    }
};

export const getAssignmentsByFreelancerId = async (req: Request, res: Response) => {
    const freelancerId = parseIdParam(res, req.params.freelancerId, 'freelancer');
    if (freelancerId === null) {
        return;
    }

    const authUser = (req as any).user as { sub: number } | undefined;
    if (!authUser?.sub || authUser.sub !== freelancerId) {
        return sendError(res, 403, 'You do not have access to these assignments.');
    }

    try {
        const assignments = await assignmentRepo.findByFreelancerId(freelancerId);
        const visibleAssignments = await filterAssignmentsWithMutualReviews(assignments);
        return sendSuccess(res, visibleAssignments);
    } catch (error) {
        console.error(`Error fetching assignments for freelancer ${freelancerId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while fetching assignments.');
    }
};

export const getAssignmentsByEmployerId = async (req: Request, res: Response) => {
    const employerId = parseIdParam(res, req.params.employerId, 'employer');
    if (employerId === null) {
        return;
    }

    const authUser = (req as any).user as { sub: number } | undefined;
    if (!authUser?.sub || authUser.sub !== employerId) {
        return sendError(res, 403, 'You do not have access to these assignments.');
    }

    try {
        const assignments = await assignmentRepo.findByEmployerId(employerId);
        const visibleAssignments = await filterAssignmentsWithMutualReviews(assignments);
        return sendSuccess(res, visibleAssignments);
    } catch (error) {
        console.error(`Error fetching assignments for employer ${employerId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while fetching assignments.');
    }
};

export const getAssignmentDeliverables = async (req: Request, res: Response) => {
    const assignmentId = parseIdParam(res, req.params.id, 'assignment');
    if (assignmentId === null) return;

    const authUser = (req as any).user as { sub: number } | undefined;
    if (!authUser?.sub) {
        return sendError(res, 401, 'Authentication required.');
    }

    try {
        const assignment = await assignmentRepo.findById(assignmentId);
        if (!assignment) {
            return sendError(res, 404, 'Assignment not found.');
        }

        const job = await jobRepo.findById(assignment.job_id ?? 0);
        const isFreelancer = assignment.freelancer_id === authUser.sub;
        const isEmployer = job?.employer_id === authUser.sub;
        if (!isFreelancer && !isEmployer) {
            return sendError(res, 403, 'You do not have access to these deliverables.');
        }

        const deliverables = await assignmentDeliverablesRepo.getByAssignmentId(assignmentId);
        return sendSuccess(res, deliverables);
    } catch (error) {
        console.error(`Error fetching deliverables for assignment ${assignmentId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while fetching deliverables.');
    }
};

function sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export const uploadAssignmentDeliverable = async (req: Request, res: Response) => {
    const assignmentId = parseIdParam(res, req.params.id, 'assignment');
    if (assignmentId === null) return;

    const authUser = (req as any).user as { sub: number } | undefined;
    if (!authUser?.sub) {
        return sendError(res, 401, 'Authentication required.');
    }

    try {
        const assignment = await assignmentRepo.findById(assignmentId);
        if (!assignment) {
            return sendError(res, 404, 'Assignment not found.');
        }

        if (assignment.freelancer_id !== authUser.sub) {
            return sendError(res, 403, 'You do not have access to this assignment.');
        }

        if (assignment.status !== 'Active') {
            return sendError(res, 400, 'You can only submit work for active assignments.');
        }

        const existingDeliverables = await assignmentDeliverablesRepo.getByAssignmentId(assignmentId);
        const hasPendingReview = existingDeliverables.some(d => d.status === 'submitted');
        if (hasPendingReview) {
            return sendError(res, 400, 'Previous submission is awaiting review.');
        }

        const form = formidable({
            maxFileSize: 50 * 1024 * 1024,
            keepExtensions: true,
            multiples: false
        });

        const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
            form.parse(req, (err, parsedFields, parsedFiles) => {
                if (err) return reject(err);
                resolve({ fields: parsedFields, files: parsedFiles });
            });
        });

        const linkRaw = fields.link?.[0] || fields.link?.toString();
        const linkUrl = typeof linkRaw === 'string' && linkRaw.trim().length > 0 ? linkRaw.trim() : null;

        if (linkUrl) {
            try {
                new URL(linkUrl);
            } catch {
                return sendError(res, 400, 'Link must be a valid URL.');
            }
        }

        const uploadFile = (files.file as File | File[] | undefined) ?? undefined;
        const file = Array.isArray(uploadFile) ? uploadFile[0] : uploadFile;

        if (!file && !linkUrl) {
            return sendError(res, 400, 'Provide a file, a link, or both.');
        }

        let filePath: string | null = null;
        let fileName: string | null = null;
        let fileSize: number | null = null;
        let mimeType: string | null = null;

        if (file) {
            const safeBase = sanitizeFilename(path.basename(file.originalFilename || 'file'));
            const ext = path.extname(safeBase);
            const baseName = safeBase.replace(ext, '') || 'file';
            const finalName = `${Date.now()}_${baseName}${ext}`;

            const assignmentFolder = path.join(process.cwd(), 'uploads', 'assignments', String(assignmentId));
            await fs.mkdir(assignmentFolder, { recursive: true });
            const destination = path.join(assignmentFolder, finalName);
            await fs.rename(file.filepath, destination);

            filePath = `/uploads/assignments/${assignmentId}/${finalName}`;
            fileName = file.originalFilename || finalName;
            fileSize = file.size ?? null;
            mimeType = file.mimetype || null;
        }

        const deliverableId = await assignmentDeliverablesRepo.create({
            assignment_id: assignmentId,
            freelancer_id: authUser.sub,
            file_path: filePath,
            file_name: fileName,
            file_size: fileSize,
            mime_type: mimeType,
            link_url: linkUrl,
            status: 'submitted'
        });

        if (!deliverableId) {
            return sendError(res, 500, 'Failed to save deliverable.');
        }

        return sendSuccess(res, {
            deliverable_id: deliverableId,
            assignment_id: assignmentId,
            freelancer_id: authUser.sub,
            file_path: filePath,
            file_name: fileName,
            file_size: fileSize,
            mime_type: mimeType,
            link_url: linkUrl,
            status: 'submitted'
        }, 201);
    } catch (error) {
        console.error('Error uploading deliverable:', error);
        if ((error as any)?.code === 'LIMIT_FILE_SIZE' || `${(error as any)?.message || ''}`.includes('maxFileSize')) {
            return sendError(res, 413, 'File is too large. Maximum size is 50MB.');
        }
        rethrowHttpError(error, 500, 'An internal server error occurred while uploading the deliverable.');
    }
};

export const reviewAssignmentDeliverable = async (req: Request, res: Response) => {
    const deliverableId = parseIdParam(res, req.params.deliverableId, 'deliverable');
    if (deliverableId === null) return;

    const { status, reviewer_message } = req.body as { status?: string; reviewer_message?: string };
    if (!status || !['accepted', 'changes_requested'].includes(status)) {
        return sendError(res, 400, 'status must be accepted or changes_requested.');
    }

    const authUser = (req as any).user as { sub: number } | undefined;
    if (!authUser?.sub) {
        return sendError(res, 401, 'Authentication required.');
    }

    try {
        const deliverable = await assignmentDeliverablesRepo.findById(deliverableId);
        if (!deliverable) {
            return sendError(res, 404, 'Deliverable not found.');
        }

        if (deliverable.status === 'accepted') {
            return sendError(res, 400, 'Deliverable already accepted.');
        }

        const assignment = await assignmentRepo.findById(deliverable.assignment_id);
        if (!assignment) {
            return sendError(res, 404, 'Assignment not found.');
        }

        const job = await jobRepo.findById(assignment.job_id ?? 0);
        if (!job || job.employer_id !== authUser.sub) {
            return sendError(res, 403, 'You do not have access to review this deliverable.');
        }

        const trimmedMessage = typeof reviewer_message === 'string' ? reviewer_message.trim() : '';

        const updated = await assignmentDeliverablesRepo.updateStatus(
            deliverableId,
            status as 'accepted' | 'changes_requested',
            trimmedMessage || null
        );

        if (!updated) {
            return sendError(res, 500, 'Failed to update deliverable status.');
        }

        if (status === 'accepted') {
            await assignmentRepo.updateStatus(assignment.assignment_id, 'Completed');
            await jobRepo.update(job.job_id, { status: 'Completed' });

            const applications = await jobAplRepo.findByJobId(job.job_id);
            const acceptedApp = applications.find(a => a.freelancer_id === assignment.freelancer_id && a.status === 'Accepted');
            if (acceptedApp) {
                await jobAplRepo.update(acceptedApp.application_id, { status: 'Completed' });
            }
        }

        if (status === 'changes_requested') {
            if (assignment.status === 'Completed') {
                await assignmentRepo.updateStatus(assignment.assignment_id, 'Active');
            }
            if (job.status === 'Completed') {
                await jobRepo.update(job.job_id, { status: 'In Progress' });
            }
        }

        if (status === 'changes_requested') {
            const messageBody = trimmedMessage
            ? `Changes requested for the job "${job.title}": ${trimmedMessage}`
            : `Changes requested for the job "${job.title}". Please review and make the updates.`;

            await messageRepo.create({
                sender_id: authUser.sub,
                receiver_id: assignment.freelancer_id,
                body: messageBody
            });
        }

        return sendSuccess(res, {
            deliverable_id: deliverableId,
            status,
            reviewer_message: reviewer_message ?? null
        });
    } catch (error) {
        console.error(`Error reviewing deliverable ${deliverableId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while reviewing deliverable.');
    }
};

export const updateAssignmentStatus = async (req: Request, res: Response) => {
    const assignmentId = parseIdParam(res, req.params.id, 'assignment');
    if (assignmentId === null) return;

    const { status } = req.body;
    const validStatuses = ['Active', 'Completed', 'Terminated'];

    if (!status || !validStatuses.includes(status)) {
        return sendError(res, 400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const authUser = (req as any).user as { sub: number } | undefined;
    if (!authUser?.sub) {
        return sendError(res, 401, 'Authentication required.');
    }

    try {
        const assignment = await assignmentRepo.findById(assignmentId);
        if (!assignment) {
            return sendError(res, 404, 'Assignment not found.');
        }

        const job = await jobRepo.findById(assignment.job_id ?? 0);
        if (!job) {
            return sendError(res, 404, 'Associated job not found.');
        }

        if (job.employer_id !== authUser.sub) {
            return sendError(res, 403, 'Only the employer can update assignment status.');
        }

        const updated = await assignmentRepo.updateStatus(assignmentId, status);
        if (!updated) {
            return sendError(res, 500, 'Failed to update assignment status.');
        }

        if (status === 'Completed') {
            await jobRepo.update(job.job_id, { status: 'Completed' });
        }

        return sendSuccess(res, { assignment_id: assignmentId, status });
    } catch (error) {
        console.error(`Error updating assignment status ${assignmentId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while updating assignment status.');
    }
};

async function filterAssignmentsWithMutualReviews(assignments: any[]): Promise<any[]> {
    if (!assignments.length) return assignments;

    const results = await Promise.all(assignments.map(async (assignment) => {
        if (assignment.status !== 'Completed') {
            return assignment;
        }

        const job = await jobRepo.findById(assignment.job_id ?? 0);
        if (!job) {
            return assignment;
        }

        const freelancerReviewed = await reviewRepo.hasReviewed(job.job_id, assignment.freelancer_id);
        const employerReviewed = await reviewRepo.hasReviewed(job.job_id, job.employer_id);

        if (freelancerReviewed && employerReviewed) {
            return null;
        }

        return assignment;
    }));

    return results.filter(Boolean);
}