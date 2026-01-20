import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/http.js';
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

router.get('/', requireAuth, asyncHandler(getAllMessages));
router.get('/user/:userId', requireAuth, asyncHandler(getMessagesByUser));
router.get('/user/:userId/unread', requireAuth, asyncHandler(getUnreadCount));
router.get('/user/:userId/conversations', requireAuth, asyncHandler(getConversations));
router.get('/conversation/:userId1/:userId2', requireAuth, asyncHandler(getConversation));
router.get('/job/:jobId', requireAuth, asyncHandler(getMessagesByJob));
router.post('/', requireAuth, asyncHandler(sendMessage));
router.get('/:id', requireAuth, asyncHandler(getMessageById));
router.patch('/:id/read', requireAuth, asyncHandler(markMessageAsRead));
router.post('/read-all', requireAuth, asyncHandler(markAllAsRead));
router.delete('/:id', requireAuth, asyncHandler(deleteMessage));

export default router;
