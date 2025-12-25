import { Request, Response } from 'express';
import { auditlogRepo } from '../repositories/auditlogRepo.js';
import { sendError, sendSuccess } from '../utils/http.js';

export const getAllAuditLogs = async (req: Request, res: Response) => {
    try {
        const data = await auditlogRepo.get_all()

        return sendSuccess(res, data);
    } catch (error){
        console.error('Error fetching audit logs', error)
        return sendError(res, 500, 'An internal server error occurred while fetching audit logs.');
    }
};

export const getAuditLogById = async (req: Request, res: Response) => {
    const logId = parseInt(req.params.id, 10); 

    if (isNaN(logId)) {
        return sendError(res, 400, 'Invalid log ID format.');
    }

    try {
        const log = await auditlogRepo.findById(logId);

        if (!log) {
            return sendError(res, 404, 'Audit log not found.');
        }

        return sendSuccess(res, log);

    } catch (error) {
        console.error(`Error fetching audit log ${logId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while fetching the audit log.');
    }
};