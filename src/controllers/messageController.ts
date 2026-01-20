import { Request, Response } from 'express';
import { messageRepo } from '../repositories/messageRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { parseIdParam, sendError, sendSuccess } from '../utils/http.js';

export const getAllMessages = async (req: Request, res: Response) => {
    try {
        const messages = await messageRepo.get_all();
        return sendSuccess(res, messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return sendError(res, 500, 'An internal server error occurred.');
    }
};

export const getMessagesByUser = async (req: Request, res: Response) => {
    const userId = parseIdParam(res, req.params.userId, 'user');
    if (userId === null) return;

    try {
        const messages = await messageRepo.findByUser(userId);
        return sendSuccess(res, messages);
    } catch (error) {
        console.error(`Error fetching messages for user ${userId}:`, error);
        return sendError(res, 500, 'An internal server error occurred.');
    }
};

export const getConversation = async (req: Request, res: Response) => {
    const userId1 = parseIdParam(res, req.params.userId1, 'user');
    if (userId1 === null) return;
    const userId2 = parseIdParam(res, req.params.userId2, 'user');
    if (userId2 === null) return;

    try {
        const messages = await messageRepo.findConversation(userId1, userId2);
        return sendSuccess(res, messages);
    } catch (error) {
        console.error(`Error fetching conversation between ${userId1} and ${userId2}:`, error);
        return sendError(res, 500, 'An internal server error occurred.');
    }
};

export const getMessagesByJob = async (req: Request, res: Response) => {
    const jobId = parseIdParam(res, req.params.jobId, 'job');
    if (jobId === null) return;

    try {
        const messages = await messageRepo.findByJob(jobId);
        return sendSuccess(res, messages);
    } catch (error) {
        console.error(`Error fetching messages for job ${jobId}:`, error);
        return sendError(res, 500, 'An internal server error occurred.');
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    const { sender_id, receiver_id, job_id, body } = req.body;
    const authUser = (req as any).user;

    if (receiver_id === undefined || !body) {
        return sendError(res, 400, 'receiver_id and body are required.');
    }

    // Use authenticated user's ID (sub or user_id), but allow sender_id from body for backward compatibility
    const actualSenderId = authUser?.sub || authUser?.user_id || sender_id;
    
    if (!actualSenderId) {
        return sendError(res, 400, 'sender_id is required.');
    }

    try {
        const sender = await userRepo.findById(actualSenderId);
        const receiver = await userRepo.findById(receiver_id);
        
        if (!sender) {
            return sendError(res, 400, 'Sender does not exist.');
        }
        if (!receiver) {
            return sendError(res, 400, 'Receiver does not exist.');
        }

        const messageId = await messageRepo.create({
            sender_id: actualSenderId,
            receiver_id,
            job_id,
            body
        });

        if (messageId) {
            const message = await messageRepo.findById(messageId);
            return sendSuccess(res, message, 201);
        } else {
            return sendError(res, 500, 'Failed to send message.');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        return sendError(res, 500, 'An internal server error occurred.');
    }
};

export const getMessageById = async (req: Request, res: Response) => {
    const messageId = parseIdParam(res, req.params.id, 'message');
    if (messageId === null) return;

    try {
        const message = await messageRepo.findById(messageId);
        if (!message) {
            return sendError(res, 404, 'Message not found.');
        }
        return sendSuccess(res, message);
    } catch (error) {
        console.error(`Error fetching message ${messageId}:`, error);
        return sendError(res, 500, 'An internal server error occurred.');
    }
};

export const markMessageAsRead = async (req: Request, res: Response) => {
    const messageId = parseIdParam(res, req.params.id, 'message');
    if (messageId === null) return;

    try {
        await messageRepo.markAsRead(messageId);
        return sendSuccess(res, { message: 'Message marked as read.' });
    } catch (error) {
        console.error(`Error marking message ${messageId} as read:`, error);
        return sendError(res, 500, 'An internal server error occurred.');
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    const { receiver_id, sender_id } = req.body;

    if (receiver_id === undefined || sender_id === undefined) {
        return sendError(res, 400, 'receiver_id and sender_id are required.');
    }

    try {
        await messageRepo.markAllAsRead(receiver_id, sender_id);
        return sendSuccess(res, { message: 'All messages marked as read.' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return sendError(res, 500, 'An internal server error occurred.');
    }
};

export const deleteMessage = async (req: Request, res: Response) => {
    const messageId = parseIdParam(res, req.params.id, 'message');
    if (messageId === null) return;

    try {
        await messageRepo.deleteById(messageId);
        return sendSuccess(res, { message: 'Message deleted.' });
    } catch (error) {
        console.error(`Error deleting message ${messageId}:`, error);
        return sendError(res, 500, 'An internal server error occurred.');
    }
};

export const getUnreadCount = async (req: Request, res: Response) => {
    const userId = parseIdParam(res, req.params.userId, 'user');
    if (userId === null) return;

    try {
        const count = await messageRepo.getUnreadCount(userId);
        return sendSuccess(res, { unread_count: count });
    } catch (error) {
        console.error(`Error getting unread count for user ${userId}:`, error);
        return sendError(res, 500, 'An internal server error occurred.');
    }
};

export const getConversations = async (req: Request, res: Response) => {
    const userId = parseIdParam(res, req.params.userId, 'user');
    if (userId === null) return;

    try {
        const conversations = await messageRepo.getConversations(userId);
        return sendSuccess(res, conversations);
    } catch (error) {
        console.error(`Error getting conversations for user ${userId}:`, error);
        return sendError(res, 500, 'An internal server error occurred.');
    }
};
