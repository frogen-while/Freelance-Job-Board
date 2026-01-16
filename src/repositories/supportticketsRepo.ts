import { db } from '../config/init_db.js';
import { TicketStatus, SupportTicket } from '../interfaces/Supportticket.js';

export const supportTicketsRepo = {

    async get_all(): Promise<SupportTicket[]> {
        const result = await db.connection?.all<SupportTicket[]>(
            'SELECT ticket_id, user_id, subject, message, status FROM supporttickets'
        );
        return result || [];
    },

    async getByUserId(user_id: number): Promise<SupportTicket[]> {
        const result = await db.connection?.all<SupportTicket[]>(
            'SELECT ticket_id, user_id, subject, message, status, created_at, updated_at FROM supporttickets WHERE user_id = ? ORDER BY created_at DESC',
            user_id
        );
        return result || [];
    },

    async create(user_id: number, subject: string, message: string, status: TicketStatus): Promise<number | null> {
        const result = await db.connection?.run(
            `INSERT INTO supporttickets (user_id, subject, message, status) VALUES (?, ?, ?, ?)`,
            user_id, subject, message, status
        );
        
        return result?.lastID ?? null;
    },

    async findById(ticket_id: number): Promise<SupportTicket | undefined> {
        return await db.connection?.get<SupportTicket | undefined>(
            `SELECT * FROM supporttickets WHERE ticket_id = ?`,
            ticket_id
        );
    },

    async update(ticket_id: number, updateData: { user_id?: number, subject?: string, message?: string, status?: TicketStatus}): Promise<boolean> {
        const setClauses: string[] = [];
        const params: (string | number)[] = [];

        if (updateData.user_id !== undefined) {
            setClauses.push('user_id = ?');
            params.push(updateData.user_id);
        }
        if (updateData.subject !== undefined) {
            setClauses.push('subject = ?');
            params.push(updateData.subject);
        }
        if (updateData.message !== undefined) {
            setClauses.push('message = ?');
            params.push(updateData.message);
        }
        if (updateData.status !== undefined) {
            setClauses.push('status = ?');
            params.push(updateData.status);
        }

        if (setClauses.length === 0) {
            return false; 
        }

        params.push(ticket_id);
        const statement = `UPDATE supporttickets SET ${setClauses.join(', ')} WHERE ticket_id = ?`;
        const result = await db.connection?.run(statement, params);
        return (result?.changes ?? 0) > 0;
    },
    
    async deleteByID(ticket_id: number): Promise<void> {
        await db.connection?.run(
            'DELETE FROM supporttickets WHERE ticket_id = ?',
            ticket_id
        );
    }

}