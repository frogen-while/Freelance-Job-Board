import { Request, Response } from 'express';
import { supportTicketsRepo } from '../repositories/supportticketsRepo.js';
import { ticketRepliesRepo } from '../repositories/ticketRepliesRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { auditLogRepo, AuditActions, EntityTypes } from '../repositories/auditLogRepo.js';
import { TicketStatus, TicketPriority } from '../interfaces/Supportticket.js';
import { sendError, sendSuccess } from '../utils/http.js';
import { User } from '../interfaces/User.js';

const VALID_STATUSES: TicketStatus[] = ['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'];
const VALID_PRIORITIES: TicketPriority[] = ['low', 'normal', 'high', 'urgent'];

export const createSupportTicket = async (req: Request, res: Response) => {
    const currentUser = (req as any).currentUser as User | undefined;
    const { subject, message } = req.body;

    const user_id = currentUser?.user_id || req.body.user_id;

    if (user_id === undefined || !subject || !message) {
        return sendError(res, 400, 'user_id, subject and message are required.');
    }

    try {
        const user = await userRepo.findById(user_id);
        if (!user) {
            return sendError(res, 400, 'user_id does not reference an existing user.');
        }

        const newTicketId = await supportTicketsRepo.create(user_id, subject, message, 'Open');

        if (newTicketId) {
            await auditLogRepo.logAction({
                user_id: user_id,
                action: AuditActions.TICKET_CREATED,
                entity_type: EntityTypes.TICKET,
                entity_id: newTicketId,
                new_value: { subject, status: 'Open' },
                ip_address: req.ip || req.socket.remoteAddress
            });

            return sendSuccess(res, { ticket_id: newTicketId }, 201);
        } else {
            return sendError(res, 500, 'Failed to create support ticket.');
        }

    } catch (error) {
        console.error('creation error:', error);
        return sendError(res, 500, 'An internal server error occurred during support ticket creation.');
    }
};

export const getAllSupportTickets = async (req: Request, res: Response) => {
    try {
        // Check if user_id is provided as a query parameter
        const userId = req.query.user_id;
        
        if (userId) {
            const parsedUserId = parseInt(userId as string, 10);
            if (isNaN(parsedUserId)) {
                return sendError(res, 400, 'Invalid user_id format.');
            }
            const data = await supportTicketsRepo.getByUserId(parsedUserId);
            return sendSuccess(res, data);
        }

        // If no user_id, return all tickets
        const data = await supportTicketsRepo.get_all()

        return sendSuccess(res, data);
    } catch (error){
        console.error('Error fetching support tickets', error)
        return sendError(res, 500, 'An internal server error occurred while fetching support tickets.');
    }
};

export const getSupportTicketById = async (req: Request, res: Response) => {
    const ticketId = parseInt(req.params.id, 10); 

    if (isNaN(ticketId)) {
        return sendError(res, 400, 'Invalid ticket ID format.');
    }

    try {
        const ticket = await supportTicketsRepo.findById(ticketId);

        if (!ticket) {
            return sendError(res, 404, 'Support ticket not found.');
        }

        return sendSuccess(res, ticket);

    } catch (error) {
        console.error(`Error fetching support ticket ${ticketId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while fetching the support ticket.');
    }
};

export const deleteSupportTicket = async(req: Request, res: Response) =>{
    const ticketId = parseInt(req.params.id, 10); 

    if (isNaN(ticketId)) {
        return sendError(res, 400, 'Invalid ticket ID format.');
    }

    try {
        await supportTicketsRepo.deleteByID(ticketId)
        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error deleting support ticket ${ticketId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while deleting the support ticket.');
    }

};

export const updateSupportTicket = async (req: Request, res: Response) => {
    const ticketId = parseInt(req.params.id, 10);
    const currentUser = (req as any).currentUser as User | undefined;
    const { subject, message, status } = req.body; 

    if (isNaN(ticketId)) {
        return sendError(res, 400, 'Invalid ticket ID format.');
    }

    const updateData: { subject?: string, message?: string, status?: TicketStatus } = {};
    
    if (subject !== undefined) updateData.subject = subject;
    if (message !== undefined) updateData.message = message;
    if (status !== undefined) {
        if (!VALID_STATUSES.includes(status)) {
            return sendError(res, 400, `status must be one of: ${VALID_STATUSES.join(', ')}`);
        }
        updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update (allowed: subject, message, status)');
    }
    
    try {
        const existingTicket = await supportTicketsRepo.findById(ticketId);
        if (!existingTicket) {
            return sendError(res, 404, 'Support ticket not found.');
        }
        
        const oldStatus = existingTicket.status;
        const success = await supportTicketsRepo.update(ticketId, updateData);

        if (success) {
            if (updateData.status && updateData.status !== oldStatus) {
                await auditLogRepo.logAction({
                    user_id: currentUser?.user_id || null,
                    action: AuditActions.TICKET_STATUS_CHANGED,
                    entity_type: EntityTypes.TICKET,
                    entity_id: ticketId,
                    old_value: { status: oldStatus },
                    new_value: { status: updateData.status },
                    ip_address: req.ip || req.socket.remoteAddress
                });
            }

            return sendSuccess(res, { message: 'Support ticket updated successfully.' });
        } else {
            return sendError(res, 500, 'Failed to update support ticket.');
        }
    } catch (error) {
        console.error(`Error updating support ticket ${ticketId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while updating the support ticket.');
    }
};

export const escalateSupportTicket = async (req: Request, res: Response) => {
    const ticketId = parseInt(req.params.id, 10);
    const currentUser = (req as any).currentUser as User;

    if (isNaN(ticketId)) {
        return sendError(res, 400, 'Invalid ticket ID format.');
    }

    try {
        const ticket = await supportTicketsRepo.findById(ticketId);
        if (!ticket) {
            return sendError(res, 404, 'Support ticket not found.');
        }

        if (ticket.status === 'Escalated') {
            return sendError(res, 400, 'Ticket is already escalated.');
        }

        if (ticket.status === 'Closed' || ticket.status === 'Resolved') {
            return sendError(res, 400, 'Cannot escalate a closed or resolved ticket.');
        }

        const oldStatus = ticket.status;
        const success = await supportTicketsRepo.update(ticketId, { status: 'Escalated' });

        if (success) {
            await auditLogRepo.logAction({
                user_id: currentUser.user_id,
                action: AuditActions.TICKET_ESCALATED,
                entity_type: EntityTypes.TICKET,
                entity_id: ticketId,
                old_value: { status: oldStatus },
                new_value: { status: 'Escalated' },
                ip_address: req.ip || req.socket.remoteAddress
            });

            return sendSuccess(res, { message: 'Ticket escalated to management successfully.' });
        } else {
            return sendError(res, 500, 'Failed to escalate ticket.');
        }
    } catch (error) {
        console.error(`Error escalating support ticket ${ticketId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while escalating the support ticket.');
    }
};

export const getMySupportTickets = async (req: Request, res: Response) => {
    // Get user_id from JWT token (req.user.sub) or from currentUser if loaded by role middleware
    const currentUser = (req as any).currentUser as User | undefined;
    const tokenUser = (req as any).user as { sub: number } | undefined;
    
    const userId = currentUser?.user_id ?? tokenUser?.sub;
    
    if (!userId) {
        return sendError(res, 401, 'User not authenticated.');
    }

    try {
        const tickets = await supportTicketsRepo.getByUserId(userId);
        return sendSuccess(res, tickets);
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        return sendError(res, 500, 'An internal server error occurred while fetching your support tickets.');
    }
};

export const assignTicket = async (req: Request, res: Response) => {
    const ticketId = parseInt(req.params.id, 10);
    const { staff_id } = req.body;
    const currentUser = (req as any).currentUser as User;

    if (isNaN(ticketId)) {
        return sendError(res, 400, 'Invalid ticket ID format.');
    }

    try {
        const ticket = await supportTicketsRepo.findById(ticketId);
        if (!ticket) {
            return sendError(res, 404, 'Support ticket not found.');
        }

        let assignedTo: number | null = null;
        if (staff_id !== null && staff_id !== undefined) {
            const staffUser = await userRepo.findById(staff_id);
            if (!staffUser) {
                return sendError(res, 400, 'Staff user not found.');
            }
            if (!['Support', 'Manager', 'Admin'].includes(staffUser.main_role)) {
                return sendError(res, 400, 'Can only assign to Support, Manager, or Admin users.');
            }
            assignedTo = staff_id;
        }

        const oldAssignedTo = ticket.assigned_to;
        const success = await supportTicketsRepo.update(ticketId, { assigned_to: assignedTo });

        if (success) {
            await auditLogRepo.logAction({
                user_id: currentUser.user_id,
                action: AuditActions.TICKET_ASSIGNED,
                entity_type: EntityTypes.TICKET,
                entity_id: ticketId,
                old_value: { assigned_to: oldAssignedTo },
                new_value: { assigned_to: assignedTo },
                ip_address: req.ip || req.socket.remoteAddress
            });

            return sendSuccess(res, { message: 'Ticket assigned successfully.' });
        } else {
            return sendError(res, 500, 'Failed to assign ticket.');
        }
    } catch (error) {
        console.error(`Error assigning ticket ${ticketId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while assigning the ticket.');
    }
};

export const updateTicketPriority = async (req: Request, res: Response) => {
    const ticketId = parseInt(req.params.id, 10);
    const { priority } = req.body;
    const currentUser = (req as any).currentUser as User;

    if (isNaN(ticketId)) {
        return sendError(res, 400, 'Invalid ticket ID format.');
    }

    if (!priority || !VALID_PRIORITIES.includes(priority)) {
        return sendError(res, 400, `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }

    try {
        const ticket = await supportTicketsRepo.findById(ticketId);
        if (!ticket) {
            return sendError(res, 404, 'Support ticket not found.');
        }

        const oldPriority = ticket.priority;
        const success = await supportTicketsRepo.update(ticketId, { priority });

        if (success) {
            await auditLogRepo.logAction({
                user_id: currentUser.user_id,
                action: AuditActions.TICKET_PRIORITY_CHANGED,
                entity_type: EntityTypes.TICKET,
                entity_id: ticketId,
                old_value: { priority: oldPriority },
                new_value: { priority },
                ip_address: req.ip || req.socket.remoteAddress
            });

            return sendSuccess(res, { message: 'Ticket priority updated successfully.' });
        } else {
            return sendError(res, 500, 'Failed to update ticket priority.');
        }
    } catch (error) {
        console.error(`Error updating ticket priority ${ticketId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while updating the ticket priority.');
    }
};

export const addTicketNote = async (req: Request, res: Response) => {
    const ticketId = parseInt(req.params.id, 10);
    const { message, is_internal = false } = req.body;
    const currentUser = (req as any).currentUser as User;

    if (isNaN(ticketId)) {
        return sendError(res, 400, 'Invalid ticket ID format.');
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return sendError(res, 400, 'Message is required.');
    }

    try {
        const ticket = await supportTicketsRepo.findById(ticketId);
        if (!ticket) {
            return sendError(res, 404, 'Support ticket not found.');
        }

        const replyId = await ticketRepliesRepo.create(ticketId, currentUser.user_id, message.trim(), is_internal);

        if (replyId) {
            await auditLogRepo.logAction({
                user_id: currentUser.user_id,
                action: AuditActions.TICKET_NOTE_ADDED,
                entity_type: EntityTypes.TICKET,
                entity_id: ticketId,
                new_value: { reply_id: replyId, is_internal },
                ip_address: req.ip || req.socket.remoteAddress
            });

            return sendSuccess(res, { message: 'Note added successfully.', reply_id: replyId }, 201);
        } else {
            return sendError(res, 500, 'Failed to add note.');
        }
    } catch (error) {
        console.error(`Error adding note to ticket ${ticketId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while adding the note.');
    }
};

export const getTicketNotes = async (req: Request, res: Response) => {
    const ticketId = parseInt(req.params.id, 10);
    const currentUser = (req as any).currentUser as User;

    if (isNaN(ticketId)) {
        return sendError(res, 400, 'Invalid ticket ID format.');
    }

    try {
        const ticket = await supportTicketsRepo.findById(ticketId);
        if (!ticket) {
            return sendError(res, 404, 'Support ticket not found.');
        }

        const isStaff = ['Support', 'Manager', 'Admin'].includes(currentUser.main_role);
        const notes = await ticketRepliesRepo.getByTicketId(ticketId, isStaff);

        return sendSuccess(res, notes);
    } catch (error) {
        console.error(`Error fetching notes for ticket ${ticketId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while fetching notes.');
    }
};

export const getTicketsFiltered = async (req: Request, res: Response) => {
    try {
        const { status, priority, assigned_to, page = '1', limit = '50' } = req.query;
        
        const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
        const offset = (pageNum - 1) * limitNum;

        const filters: any = { limit: limitNum, offset };
        
        if (status && VALID_STATUSES.includes(status as TicketStatus)) {
            filters.status = status as TicketStatus;
        }
        if (priority && VALID_PRIORITIES.includes(priority as TicketPriority)) {
            filters.priority = priority as TicketPriority;
        }
        if (assigned_to !== undefined) {
            filters.assigned_to = assigned_to === 'null' ? null : parseInt(assigned_to as string, 10);
        }

        const tickets = await supportTicketsRepo.getWithFilters(filters);

        // Return tickets array directly for frontend compatibility
        return sendSuccess(res, tickets);
    } catch (error) {
        console.error('Error fetching filtered tickets:', error);
        return sendError(res, 500, 'An internal server error occurred while fetching tickets.');
    }
};