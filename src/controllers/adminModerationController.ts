import { Request, Response } from 'express';
import { jobFlagsRepo } from '../repositories/jobFlagsRepo.js';
import { jobRepo } from '../repositories/jobRepo.js';
import { auditLogRepo, AuditActions, EntityTypes } from '../repositories/auditLogRepo.js';
import { parseIdParam, sendError, sendSuccess } from '../utils/http.js';
import { User } from '../interfaces/User.js';

export const flagJob = async (req: Request, res: Response) => {
  try {
    const jobId = parseIdParam(res, req.params.id, 'job');
    const { reason } = req.body;
    const currentUser = (req as any).currentUser as User;
    if (jobId === null) return;

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return sendError(res, 400, 'Reason is required.');
    }

    const job = await jobRepo.findById(jobId);
    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    const flagId = await jobFlagsRepo.create(jobId, currentUser.user_id, reason.trim());

    if (!flagId) {
      return sendError(res, 500, 'Failed to flag job.');
    }

    await auditLogRepo.logAction({
      user_id: currentUser.user_id,
      action: AuditActions.JOB_FLAGGED,
      entity_type: EntityTypes.JOB,
      entity_id: jobId,
      new_value: { reason: reason.trim(), flag_id: flagId },
      ip_address: req.ip || req.socket.remoteAddress
    });

    return sendSuccess(res, { message: 'Job flagged successfully.', flag_id: flagId }, 201);
  } catch (error) {
    console.error('Error flagging job:', error);
    return sendError(res, 500, 'Failed to flag job.');
  }
};

export const getJobFlags = async (req: Request, res: Response) => {
  try {
    const jobId = parseIdParam(res, req.params.id, 'job');
    if (jobId === null) return;

    const flags = await jobFlagsRepo.getByJobId(jobId);
    return sendSuccess(res, flags);
  } catch (error) {
    console.error('Error getting job flags:', error);
    return sendError(res, 500, 'Failed to get job flags.');
  }
};

export const getPendingFlags = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const [flags, total] = await Promise.all([
      jobFlagsRepo.getPending(limitNum, offset),
      jobFlagsRepo.getPendingCount()
    ]);

    return sendSuccess(res, {
      data: flags,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error getting pending flags:', error);
    return sendError(res, 500, 'Failed to get pending flags.');
  }
};

export const reviewFlag = async (req: Request, res: Response) => {
  try {
    const flagId = parseIdParam(res, req.params.flagId, 'flag');
    const { status } = req.body;
    const currentUser = (req as any).currentUser as User;
    if (flagId === null) return;

    if (!status || !['reviewed', 'dismissed'].includes(status)) {
      return sendError(res, 400, 'Status must be "reviewed" or "dismissed".');
    }

    const flag = await jobFlagsRepo.findById(flagId);
    if (!flag) {
      return sendError(res, 404, 'Flag not found.');
    }

    const success = await jobFlagsRepo.updateStatus(flagId, status, currentUser.user_id);

    if (!success) {
      return sendError(res, 500, 'Failed to update flag status.');
    }

    return sendSuccess(res, { message: `Flag ${status} successfully.` });
  } catch (error) {
    console.error('Error reviewing flag:', error);
    return sendError(res, 500, 'Failed to review flag.');
  }
};

export const hideJob = async (req: Request, res: Response) => {
  try {
    const jobId = parseIdParam(res, req.params.id, 'job');
    const { reason } = req.body;
    const currentUser = (req as any).currentUser as User;
    if (jobId === null) return;

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return sendError(res, 400, 'Reason is required.');
    }

    const job = await jobRepo.findById(jobId);
    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    if (job.is_hidden) {
      return sendError(res, 400, 'Job is already hidden.');
    }

    const success = await jobFlagsRepo.hideJob(jobId, reason.trim(), currentUser.user_id);

    if (!success) {
      return sendError(res, 500, 'Failed to hide job.');
    }

    await auditLogRepo.logAction({
      user_id: currentUser.user_id,
      action: AuditActions.JOB_HIDDEN,
      entity_type: EntityTypes.JOB,
      entity_id: jobId,
      old_value: { is_hidden: false },
      new_value: { is_hidden: true, reason: reason.trim() },
      ip_address: req.ip || req.socket.remoteAddress
    });

    return sendSuccess(res, { message: 'Job hidden successfully.' });
  } catch (error) {
    console.error('Error hiding job:', error);
    return sendError(res, 500, 'Failed to hide job.');
  }
};

export const restoreJob = async (req: Request, res: Response) => {
  try {
    const jobId = parseIdParam(res, req.params.id, 'job');
    const currentUser = (req as any).currentUser as User;
    if (jobId === null) return;

    const job = await jobRepo.findById(jobId);
    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    if (!job.is_hidden) {
      return sendError(res, 400, 'Job is not hidden.');
    }

    const success = await jobFlagsRepo.restoreJob(jobId);

    if (!success) {
      return sendError(res, 500, 'Failed to restore job.');
    }

    await auditLogRepo.logAction({
      user_id: currentUser.user_id,
      action: AuditActions.JOB_RESTORED,
      entity_type: EntityTypes.JOB,
      entity_id: jobId,
      old_value: { is_hidden: true, reason: job.hidden_reason },
      new_value: { is_hidden: false },
      ip_address: req.ip || req.socket.remoteAddress
    });

    return sendSuccess(res, { message: 'Job restored successfully.' });
  } catch (error) {
    console.error('Error restoring job:', error);
    return sendError(res, 500, 'Failed to restore job.');
  }
};

export const getHiddenJobs = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      jobFlagsRepo.getHiddenJobs(limitNum, offset),
      jobFlagsRepo.getHiddenCount()
    ]);

    return sendSuccess(res, {
      data: jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error getting hidden jobs:', error);
    return sendError(res, 500, 'Failed to get hidden jobs.');
  }
};
