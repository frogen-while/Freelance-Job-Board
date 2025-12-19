import { Request, Response } from 'express';
import { supportTicketsRepo } from '../repositories/supportticketsRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { status } from '../interfaces/Supportticket.js';

export const createSupportTicket = async (req: Request, res: Response) => {
    const {user_id, support_id, subject, message, status} = req.body;

    if (user_id === undefined || support_id === undefined || !subject || !message || !status) {
        return res.status(400).json({ error: 'user_id, support_id, subject, message and status are required.' });
    }

    if (!['Open', 'In Progress', 'Closed'].includes(status)) {
        return res.status(400).json({ error: 'status must be Open, In Progress, or Closed.' });
    }

    try {
        const user = await userRepo.findById(user_id);
        if (!user) {
            return res.status(400).json({ error: 'user_id does not reference an existing user.' });
        }

        const support = await userRepo.findById(support_id);
        if (!support) {
            return res.status(400).json({ error: 'support_id does not reference an existing user.' });
        }

        const newTicketId = await supportTicketsRepo.create(user_id, support_id, subject, message, status);

        if (newTicketId) {
            return res.status(201).json({ 
                message: 'Support ticket successfully created.', 
                ticket_id: newTicketId,
                subject: subject
            });
        } else {
            return res.status(500).json({ error: 'Failed to create support ticket.' });
        }

    } catch (error) {
        console.error('creation error:', error);
        return res.status(500).json({ error: 'An internal server error occurred during support ticket creation.' });
    }
};

export const getAllSupportTickets = async (req: Request, res: Response) => {
    try {
        const data = await supportTicketsRepo.get_all()

        return res.status(200).json(
        {
            data
        });
    } catch (error){
        console.error('Error fetching support tickets', error)
        return res.status(500).json({ error: 'An internal server error occurred while fetching support tickets.' });
    }
};

export const getSupportTicketById = async (req: Request, res: Response) => {
    const ticketId = parseInt(req.params.id, 10); 

    if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID format.' });
    }

    try {
        const ticket = await supportTicketsRepo.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({ error: 'support ticket not found.' });
        }

        return res.status(200).json({ data: ticket });

    } catch (error) {
        console.error(`Error fetching support ticket ${ticketId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while fetching the support ticket.' });
    }
};

export const deleteSupportTicket = async(req: Request, res: Response) =>{
    const ticketId = parseInt(req.params.id, 10); 

    if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID format.' });
    }

    try {
        await supportTicketsRepo.deleteByID(ticketId)
        return res.status(204).send();
    } catch (error) {
        console.error(`Error deleting support ticket ${ticketId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while deleting the support ticket.' });
    }

};

export const updateSupportTicket = async (req: Request, res: Response) => {
    const ticketId = parseInt(req.params.id, 10);
    const { user_id, support_id, subject, message, status} = req.body; 

    if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID format.' });
    }

    const updateData: {user_id?: number, support_id?: number, subject?: string, message?: string, status?: status} = {};
    
    if (user_id !== undefined) {
        const user = await userRepo.findById(user_id);
        if (!user) {
            return res.status(400).json({ error: 'user_id does not reference an existing user.' });
        }
        updateData.user_id = user_id;
    }
    if (support_id !== undefined) {
        const support = await userRepo.findById(support_id);
        if (!support) {
            return res.status(400).json({ error: 'support_id does not reference an existing user.' });
        }
        updateData.support_id = support_id;
    }
    if (subject !== undefined) updateData.subject = subject;
    if (message !== undefined) updateData.message = message;
    if (status !== undefined) {
        if (!['Open', 'In Progress', 'Closed'].includes(status)) {
            return res.status(400).json({ error: 'status must be Open, In Progress, or Closed.' });
        }
        updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update (allowed: user_id, support_id, subject, message, status)' })
    }
    
    try {
        const existingTicket = await supportTicketsRepo.findById(ticketId);
        if (!existingTicket) {
            return res.status(404).json({ error: 'support ticket not found.' });
        }
        
        const success = await supportTicketsRepo.update(ticketId, updateData);

        if (success) {
            return res.status(200).json({ message: 'support ticket updated successfully.' });
        } else {
            return res.status(500).json({ error: 'Failed to update support ticket.' });
        }
    } catch (error) {
        console.error(`Error updating support ticket ${ticketId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while updating the support ticket.' });
    }
};