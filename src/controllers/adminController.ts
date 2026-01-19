import { Request, Response } from 'express';
import { userRepo } from '../repositories/userRepo.js';
import { supportTicketsRepo } from '../repositories/supportticketsRepo.js';
import { auditLogRepo, AuditActions, EntityTypes } from '../repositories/auditLogRepo.js';
import { sendError, sendSuccess } from '../utils/http.js';
import { User, MainRole } from '../interfaces/User.js';
import { TicketStatus } from '../interfaces/Supportticket.js';

type Role = 'Admin' | 'Manager' | 'Support' | 'Employer' | 'Freelancer';

const validRoles: Role[] = ['Admin', 'Manager', 'Support', 'Employer', 'Freelancer'];
const validTicketStatuses: TicketStatus[] = ['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'];

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, is_blocked, search } = req.query;

    let users = await userRepo.get_all();

    if (role && typeof role === 'string') {
      users = users.filter(u => u.main_role === role);
    }

    if (is_blocked !== undefined) {
      const blocked = is_blocked === 'true';
      users = users.filter(u => (u.is_blocked === true) === blocked);
    }

    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      users = users.filter(u =>
        u.first_name.toLowerCase().includes(searchLower) ||
        u.last_name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      );
    }

    const safeUsers = users.map(({ password_hash, ...user }) => user);

    return sendSuccess(res, safeUsers);
  } catch (error) {
    console.error('Error getting all users:', error);
    return sendError(res, 500, 'Failed to get users.');
  }
};

export const assignRole = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;
    const currentUser = (req as any).currentUser as User;

    if (isNaN(userId)) {
      return sendError(res, 400, 'Invalid user ID.');
    }

    if (!role || !validRoles.includes(role)) {
      return sendError(res, 400, `Invalid role. Valid roles: ${validRoles.join(', ')}`);
    }

    const targetUser = await userRepo.findById(userId);
    if (!targetUser) {
      return sendError(res, 404, 'User not found.');
    }

    if (targetUser.user_id === currentUser.user_id) {
      return sendError(res, 400, 'You cannot change your own role.');
    }

    if (currentUser.main_role === 'Manager') {
      if (['Admin', 'Manager'].includes(role)) {
        return sendError(res, 403, 'Managers can only assign Support, Employer, or Freelancer roles.');
      }
      if (['Admin', 'Manager'].includes(targetUser.main_role)) {
        return sendError(res, 403, 'Managers cannot modify Admin or Manager roles.');
      }
    }

    const oldRole = targetUser.main_role;

    const success = await userRepo.update(userId, { main_role: role });

    if (!success) {
      return sendError(res, 500, 'Failed to update user role.');
    }

    await auditLogRepo.logAction({
      user_id: currentUser.user_id,
      action: AuditActions.ROLE_CHANGE,
      entity_type: EntityTypes.USER,
      entity_id: userId,
      old_value: { role: oldRole },
      new_value: { role },
      ip_address: req.ip || req.socket.remoteAddress
    });

    return sendSuccess(res, {
      message: 'Role updated successfully.',
      user_id: userId,
      old_role: oldRole,
      new_role: role
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    return sendError(res, 500, 'Failed to assign role.');
  }
};

export const blockUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const currentUser = (req as any).currentUser as User;

    if (isNaN(userId)) {
      return sendError(res, 400, 'Invalid user ID.');
    }

    const targetUser = await userRepo.findById(userId);
    if (!targetUser) {
      return sendError(res, 404, 'User not found.');
    }

    if (targetUser.main_role === 'Admin') {
      return sendError(res, 403, 'Cannot block Admin users.');
    }

    if (targetUser.user_id === currentUser.user_id) {
      return sendError(res, 400, 'You cannot block yourself.');
    }

    if (targetUser.is_blocked) {
      return sendError(res, 400, 'User is already blocked.');
    }

    const success = await userRepo.updateBlockStatus(userId, true);

    if (!success) {
      return sendError(res, 500, 'Failed to block user.');
    }

    await auditLogRepo.logAction({
      user_id: currentUser.user_id,
      action: AuditActions.USER_BLOCKED,
      entity_type: EntityTypes.USER,
      entity_id: userId,
      old_value: { is_blocked: false },
      new_value: { is_blocked: true },
      ip_address: req.ip || req.socket.remoteAddress
    });

    return sendSuccess(res, {
      message: 'User blocked successfully.',
      user_id: userId
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    return sendError(res, 500, 'Failed to block user.');
  }
};

export const unblockUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const currentUser = (req as any).currentUser as User;

    if (isNaN(userId)) {
      return sendError(res, 400, 'Invalid user ID.');
    }

    const targetUser = await userRepo.findById(userId);
    if (!targetUser) {
      return sendError(res, 404, 'User not found.');
    }

    if (!targetUser.is_blocked) {
      return sendError(res, 400, 'User is not blocked.');
    }

    const success = await userRepo.updateBlockStatus(userId, false);

    if (!success) {
      return sendError(res, 500, 'Failed to unblock user.');
    }

    await auditLogRepo.logAction({
      user_id: currentUser.user_id,
      action: AuditActions.USER_UNBLOCKED,
      entity_type: EntityTypes.USER,
      entity_id: userId,
      old_value: { is_blocked: true },
      new_value: { is_blocked: false },
      ip_address: req.ip || req.socket.remoteAddress
    });

    return sendSuccess(res, {
      message: 'User unblocked successfully.',
      user_id: userId
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return sendError(res, 500, 'Failed to unblock user.');
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { user_id, entity_type, action, page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const filters = {
      user_id: user_id ? parseInt(user_id as string, 10) : undefined,
      entity_type: entity_type as string | undefined,
      action: action as string | undefined,
      limit: limitNum,
      offset
    };

    const [logs, total] = await Promise.all([
      auditLogRepo.getLogs(filters),
      auditLogRepo.getLogsCount({
        user_id: filters.user_id,
        entity_type: filters.entity_type,
        action: filters.action
      })
    ]);

    const parsedLogs = logs.map(log => ({
      ...log,
      old_value: log.old_value ? JSON.parse(log.old_value as string) : null,
      new_value: log.new_value ? JSON.parse(log.new_value as string) : null
    }));

    return sendSuccess(res, {
      data: parsedLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return sendError(res, 500, 'Failed to get audit logs.');
  }
};
export const bulkBlockUsers = async (req: Request, res: Response) => {
  try {
    const { user_ids } = req.body;
    const currentUser = (req as any).currentUser as User;

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return sendError(res, 400, 'user_ids must be a non-empty array.');
    }

    if (user_ids.length > 100) {
      return sendError(res, 400, 'Maximum 100 users can be blocked at once.');
    }

    const filteredIds = user_ids.filter((id: any) => typeof id === 'number' && id !== currentUser.user_id);
    
    if (filteredIds.length === 0) {
      return sendError(res, 400, 'No valid user IDs provided.');
    }

    const affected = await userRepo.bulkUpdateBlockStatus(filteredIds, true);

    await auditLogRepo.logAction({
      user_id: currentUser.user_id,
      action: AuditActions.BULK_BLOCK,
      entity_type: EntityTypes.USER,
      entity_id: null,
      new_value: { user_ids: filteredIds, affected },
      ip_address: req.ip || req.socket.remoteAddress
    });

    return sendSuccess(res, {
      message: `${affected} users blocked successfully.`,
      affected
    });
  } catch (error) {
    console.error('Error bulk blocking users:', error);
    return sendError(res, 500, 'Failed to block users.');
  }
};

export const bulkUnblockUsers = async (req: Request, res: Response) => {
  try {
    const { user_ids } = req.body;
    const currentUser = (req as any).currentUser as User;

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return sendError(res, 400, 'user_ids must be a non-empty array.');
    }

    if (user_ids.length > 100) {
      return sendError(res, 400, 'Maximum 100 users can be unblocked at once.');
    }

    const filteredIds = user_ids.filter((id: any) => typeof id === 'number');
    
    if (filteredIds.length === 0) {
      return sendError(res, 400, 'No valid user IDs provided.');
    }

    const affected = await userRepo.bulkUpdateBlockStatus(filteredIds, false);

    await auditLogRepo.logAction({
      user_id: currentUser.user_id,
      action: AuditActions.BULK_UNBLOCK,
      entity_type: EntityTypes.USER,
      entity_id: null,
      new_value: { user_ids: filteredIds, affected },
      ip_address: req.ip || req.socket.remoteAddress
    });

    return sendSuccess(res, {
      message: `${affected} users unblocked successfully.`,
      affected
    });
  } catch (error) {
    console.error('Error bulk unblocking users:', error);
    return sendError(res, 500, 'Failed to unblock users.');
  }
};

export const bulkAssignRole = async (req: Request, res: Response) => {
  try {
    const { user_ids, role } = req.body;
    const currentUser = (req as any).currentUser as User;

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return sendError(res, 400, 'user_ids must be a non-empty array.');
    }

    if (user_ids.length > 100) {
      return sendError(res, 400, 'Maximum 100 users can be updated at once.');
    }

    if (!role || !validRoles.includes(role)) {
      return sendError(res, 400, `Invalid role. Valid roles: ${validRoles.join(', ')}`);
    }

    const filteredIds = user_ids.filter((id: any) => typeof id === 'number' && id !== currentUser.user_id);
    
    if (filteredIds.length === 0) {
      return sendError(res, 400, 'No valid user IDs provided.');
    }

    let excludeRoles: Role[] = ['Admin'];
    if (currentUser.main_role === 'Manager') {
      if (['Admin', 'Manager'].includes(role)) {
        return sendError(res, 403, 'Managers can only assign Support, Employer, or Freelancer roles.');
      }
      excludeRoles = ['Admin', 'Manager'];
    }

    const affected = await userRepo.bulkUpdateRole(filteredIds, role as MainRole, excludeRoles as MainRole[]);

    await auditLogRepo.logAction({
      user_id: currentUser.user_id,
      action: AuditActions.BULK_ROLE_CHANGE,
      entity_type: EntityTypes.USER,
      entity_id: null,
      new_value: { user_ids: filteredIds, role, affected },
      ip_address: req.ip || req.socket.remoteAddress
    });

    return sendSuccess(res, {
      message: `${affected} users updated to role ${role}.`,
      affected,
      role
    });
  } catch (error) {
    console.error('Error bulk assigning role:', error);
    return sendError(res, 500, 'Failed to assign roles.');
  }
};

export const bulkUpdateTicketStatus = async (req: Request, res: Response) => {
  try {
    const { ticket_ids, status } = req.body;
    const currentUser = (req as any).currentUser as User;

    if (!Array.isArray(ticket_ids) || ticket_ids.length === 0) {
      return sendError(res, 400, 'ticket_ids must be a non-empty array.');
    }

    if (ticket_ids.length > 100) {
      return sendError(res, 400, 'Maximum 100 tickets can be updated at once.');
    }

    if (!status || !validTicketStatuses.includes(status)) {
      return sendError(res, 400, `Invalid status. Valid statuses: ${validTicketStatuses.join(', ')}`);
    }

    const filteredIds = ticket_ids.filter((id: any) => typeof id === 'number');
    
    if (filteredIds.length === 0) {
      return sendError(res, 400, 'No valid ticket IDs provided.');
    }

    const affected = await supportTicketsRepo.bulkUpdateStatus(filteredIds, status);

    await auditLogRepo.logAction({
      user_id: currentUser.user_id,
      action: AuditActions.BULK_TICKET_STATUS,
      entity_type: EntityTypes.TICKET,
      entity_id: null,
      new_value: { ticket_ids: filteredIds, status, affected },
      ip_address: req.ip || req.socket.remoteAddress
    });

    return sendSuccess(res, {
      message: `${affected} tickets updated to status ${status}.`,
      affected,
      status
    });
  } catch (error) {
    console.error('Error bulk updating ticket status:', error);
    return sendError(res, 500, 'Failed to update tickets.');
  }
};

export const bulkDeleteTickets = async (req: Request, res: Response) => {
  try {
    const { ticket_ids } = req.body;
    const currentUser = (req as any).currentUser as User;

    if (!Array.isArray(ticket_ids) || ticket_ids.length === 0) {
      return sendError(res, 400, 'ticket_ids must be a non-empty array.');
    }

    if (ticket_ids.length > 100) {
      return sendError(res, 400, 'Maximum 100 tickets can be deleted at once.');
    }

    const filteredIds = ticket_ids.filter((id: any) => typeof id === 'number');
    
    if (filteredIds.length === 0) {
      return sendError(res, 400, 'No valid ticket IDs provided.');
    }

    const affected = await supportTicketsRepo.bulkDelete(filteredIds);

    await auditLogRepo.logAction({
      user_id: currentUser.user_id,
      action: AuditActions.BULK_TICKET_DELETE,
      entity_type: EntityTypes.TICKET,
      entity_id: null,
      new_value: { ticket_ids: filteredIds, affected },
      ip_address: req.ip || req.socket.remoteAddress
    });

    return sendSuccess(res, {
      message: `${affected} tickets deleted.`,
      affected
    });
  } catch (error) {
    console.error('Error bulk deleting tickets:', error);
    return sendError(res, 500, 'Failed to delete tickets.');
  }
};