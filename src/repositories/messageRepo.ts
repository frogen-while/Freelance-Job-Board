import { db } from '../config/init_db.js';
import { Message } from '../interfaces/Message.js';

export const messageRepo = {
    async get_all(): Promise<Message[]> {
        const result = await db.connection?.all<Message[]>(
            `SELECT * FROM messages ORDER BY sent_at DESC`
        );
        return result || [];
    },

    async findBySender(sender_id: number): Promise<Message[]> {
        const result = await db.connection?.all<Message[]>(
            `SELECT * FROM messages WHERE sender_id = ? ORDER BY sent_at DESC`,
            sender_id
        );
        return result || [];
    },

    async findByReceiver(receiver_id: number): Promise<Message[]> {
        const result = await db.connection?.all<Message[]>(
            `SELECT * FROM messages WHERE receiver_id = ? ORDER BY sent_at DESC`,
            receiver_id
        );
        return result || [];
    },

    async findByUser(user_id: number): Promise<Message[]> {
        const result = await db.connection?.all<Message[]>(
            `SELECT m.*, 
                    s.first_name || ' ' || s.last_name as sender_name,
                    r.first_name || ' ' || r.last_name as receiver_name
             FROM messages m
             LEFT JOIN users s ON m.sender_id = s.user_id
             LEFT JOIN users r ON m.receiver_id = r.user_id
             WHERE m.sender_id = ? OR m.receiver_id = ? 
             ORDER BY m.sent_at DESC`,
            user_id, user_id
        );
        return result || [];
    },

    async findConversation(user_id_1: number, user_id_2: number): Promise<Message[]> {
        const result = await db.connection?.all<Message[]>(
            `SELECT m.*,
                    s.first_name || ' ' || s.last_name as sender_name,
                    r.first_name || ' ' || r.last_name as receiver_name
             FROM messages m
             LEFT JOIN users s ON m.sender_id = s.user_id
             LEFT JOIN users r ON m.receiver_id = r.user_id
             WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
             ORDER BY m.sent_at ASC`,
            user_id_1, user_id_2, user_id_2, user_id_1
        );
        return result || [];
    },

    async create(data: {
        sender_id: number;
        receiver_id: number;
        body: string;
    }): Promise<number | null> {
        const result = await db.connection?.run(
            `INSERT INTO messages (sender_id, receiver_id, body) VALUES (?, ?, ?)`,
            data.sender_id,
            data.receiver_id,
            data.body
        );
        return result?.lastID ?? null;
    },

    async findById(message_id: number): Promise<Message | undefined> {
        return await db.connection?.get<Message | undefined>(
            `SELECT * FROM messages WHERE message_id = ?`,
            message_id
        );
    },

    async markAsRead(message_id: number): Promise<boolean> {
        const result = await db.connection?.run(
            `UPDATE messages SET is_read = 1 WHERE message_id = ?`,
            message_id
        );
        return (result?.changes ?? 0) > 0;
    },

    async markAllAsRead(receiver_id: number, sender_id: number): Promise<boolean> {
        const result = await db.connection?.run(
            `UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0`,
            receiver_id, sender_id
        );
        return (result?.changes ?? 0) > 0;
    },

    async deleteById(message_id: number): Promise<void> {
        await db.connection?.run('DELETE FROM messages WHERE message_id = ?', message_id);
    },

    async getUnreadCount(user_id: number): Promise<number> {
        const result = await db.connection?.get<{ count: number }>(
            `SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0`,
            user_id
        );
        return result?.count ?? 0;
    },

    async getConversations(user_id: number): Promise<any[]> {
        const result = await db.connection?.all(
            `SELECT 
                CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_user_id,
                u.first_name || ' ' || u.last_name as other_user_name,
                p.photo_url as other_user_photo,
                m.body as last_message,
                m.sent_at as last_message_time,
                (SELECT COUNT(*) FROM messages m2 
                 WHERE m2.sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END 
                 AND m2.receiver_id = ? AND m2.is_read = 0) as unread_count
            FROM messages m
            JOIN users u ON u.user_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
            LEFT JOIN profiles p ON p.user_id = u.user_id
            WHERE m.sender_id = ? OR m.receiver_id = ?
            AND m.sent_at = (
                SELECT MAX(m3.sent_at) FROM messages m3 
                WHERE (m3.sender_id = ? AND m3.receiver_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
                   OR (m3.receiver_id = ? AND m3.sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
            )
            GROUP BY other_user_id
            ORDER BY m.sent_at DESC`,
            user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id
        );
        return result || [];
    }
};
