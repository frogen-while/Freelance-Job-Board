import { Request, Response } from 'express';
import { auditlogRepo } from '../repositories/auditlogRepo.js';

export const getAllAuditLogs = async (req: Request, res: Response) => {
    try {
        const data = await auditlogRepo.get_all()

        return res.status(200).json(
        {
            data
        });
    } catch (error){
        console.error('Error fetching audit logs', error)
        return res.status(500).json({ error: 'An internal server error occurred while fetching audit logs.' });
    }
};

export const getAuditLogById = async (req: Request, res: Response) => {
    const logId = parseInt(req.params.id, 10); 

    if (isNaN(logId)) {
        return res.status(400).json({ error: 'Invalid log ID format.' });
    }

    try {
        const log = await auditlogRepo.findById(logId);

        if (!log) {
            return res.status(404).json({ error: 'audit log not found.' });
        }

        return res.status(200).json({ data: log });

    } catch (error) {
        console.error(`Error fetching audit log ${logId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while fetching the audit log.' });
    }
};