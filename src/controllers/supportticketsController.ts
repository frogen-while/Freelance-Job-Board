import { Request, Response } from 'express';
import { supportTicketsRepo } from '../repositories/supportticketsRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { TicketStatus } from '../interfaces/Supportticket.js';
import { sendError, sendSuccess } from '../utils/http.js';

export const createSupportTicket = async (req: Request, res: Response) => {
    const {user_id, support_id, subject, message, status} = req.body;

    if (user_id === undefined || support_id === undefined || !subject || !message || !status) {
        return sendError(res, 400, 'user_id, support_id, subject, message and status are required.');
    }

    if (!['Open', 'In Progress', 'Closed'].includes(status)) {
        return sendError(res, 400, 'status must be Open, In Progress, or Closed.');
    }

    try {
        const user = await userRepo.findById(user_id);
        if (!user) {
            return sendError(res, 400, 'user_id does not reference an existing user.');
        }

        const support = await userRepo.findById(support_id);
        if (!support) {
            return sendError(res, 400, 'support_id does not reference an existing user.');
        }

        const newTicketId = await supportTicketsRepo.create(user_id, support_id, subject, message, status);

        if (newTicketId) {
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
    const { user_id, support_id, subject, message, status} = req.body; 

    if (isNaN(ticketId)) {
        return sendError(res, 400, 'Invalid ticket ID format.');
    }

    const updateData: {user_id?: number, support_id?: number, subject?: string, message?: string, status?: TicketStatus} = {};
    
    if (user_id !== undefined) {
        const user = await userRepo.findById(user_id);
        if (!user) {
            return sendError(res, 400, 'user_id does not reference an existing user.');
        }
        updateData.user_id = user_id;
    }
    if (support_id !== undefined) {
        const support = await userRepo.findById(support_id);
        if (!support) {
            return sendError(res, 400, 'support_id does not reference an existing user.');
        }
        updateData.support_id = support_id;
    }
    if (subject !== undefined) updateData.subject = subject;
    if (message !== undefined) updateData.message = message;
    if (status !== undefined) {
        if (!['Open', 'In Progress', 'Closed'].includes(status)) {
            return sendError(res, 400, 'status must be Open, In Progress, or Closed.');
        }
        updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update (allowed: user_id, support_id, subject, message, status)')
    }
    
    try {
        const existingTicket = await supportTicketsRepo.findById(ticketId);
        if (!existingTicket) {
            return sendError(res, 404, 'Support ticket not found.');
        }
        
        const success = await supportTicketsRepo.update(ticketId, updateData);

        if (success) {
            return sendSuccess(res, { message: 'Support ticket updated successfully.' });
        } else {
            return sendError(res, 500, 'Failed to update support ticket.');
        }
    } catch (error) {
        console.error(`Error updating support ticket ${ticketId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while updating the support ticket.');
    }
};