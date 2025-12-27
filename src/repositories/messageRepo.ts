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
            `SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ? ORDER BY sent_at DESC`,
            user_id, user_id
        );
        return result || [];
    },

    async findByJob(job_id: number): Promise<Message[]> {
        const result = await db.connection?.all<Message[]>(
            `SELECT * FROM messages WHERE job_id = ? ORDER BY sent_at ASC`,
            job_id
        );
        return result || [];
    },

    async findConversation(user_id_1: number, user_id_2: number): Promise<Message[]> {
        const result = await db.connection?.all<Message[]>(
            `SELECT * FROM messages 
             WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
             ORDER BY sent_at ASC`,
            user_id_1, user_id_2, user_id_2, user_id_1
        );
        return result || [];
    },

    async create(data: {
        sender_id: number;
        receiver_id: number;
        job_id?: number;
        body: string;
    }): Promise<number | null> {
        const result = await db.connection?.run(
            `INSERT INTO messages (sender_id, receiver_id, job_id, body) VALUES (?, ?, ?, ?)`,
            data.sender_id,
            data.receiver_id,
            data.job_id || null,
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
    }
};
