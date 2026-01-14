import { Router } from 'express';
import {
    getAllMessages,
    getMessagesByUser,
    getConversation,
    getMessagesByJob,
    sendMessage,
    getMessageById,
    markMessageAsRead,
    markAllAsRead,
    deleteMessage,
    getUnreadCount,
    getConversations
} from '../controllers/messageController.js';

const router = Router();

router.get('/', getAllMessages);
router.get('/user/:userId', getMessagesByUser);
router.get('/user/:userId/unread', getUnreadCount);
router.get('/user/:userId/conversations', getConversations);
router.get('/conversation/:userId1/:userId2', getConversation);
router.get('/job/:jobId', getMessagesByJob);
router.post('/', sendMessage);
router.get('/:id', getMessageById);
router.patch('/:id/read', markMessageAsRead);
router.post('/read-all', markAllAsRead);
router.delete('/:id', deleteMessage);

export default router;
