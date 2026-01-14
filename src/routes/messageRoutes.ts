import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
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

router.get('/', requireAuth, getAllMessages);
router.get('/user/:userId', requireAuth, getMessagesByUser);
router.get('/user/:userId/unread', requireAuth, getUnreadCount);
router.get('/user/:userId/conversations', requireAuth, getConversations);
router.get('/conversation/:userId1/:userId2', requireAuth, getConversation);
router.get('/job/:jobId', requireAuth, getMessagesByJob);
router.post('/', requireAuth, sendMessage);
router.get('/:id', requireAuth, getMessageById);
router.patch('/:id/read', requireAuth, markMessageAsRead);
router.post('/read-all', requireAuth, markAllAsRead);
router.delete('/:id', requireAuth, deleteMessage);

export default router;
