import { db } from '../config/init_db.js';
import { TicketStatus, SupportTicket, TicketPriority } from '../interfaces/Supportticket.js';

export const supportTicketsRepo = {

    async get_all(): Promise<SupportTicket[]> {
        const result = await db.connection?.all<SupportTicket[]>(
            'SELECT ticket_id, user_id, subject, message, status, priority, assigned_to FROM supporttickets'
        );
        return result || [];
    },

    async getByUserId(user_id: number): Promise<SupportTicket[]> {
        const result = await db.connection?.all<SupportTicket[]>(
            'SELECT ticket_id, user_id, subject, message, status, priority, assigned_to, created_at, updated_at FROM supporttickets WHERE user_id = ? ORDER BY created_at DESC',
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

    async update(ticket_id: number, updateData: { user_id?: number, subject?: string, message?: string, status?: TicketStatus, priority?: TicketPriority, assigned_to?: number | null }): Promise<boolean> {
        const setClauses: string[] = [];
        const params: (string | number | null)[] = [];

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
        if (updateData.priority !== undefined) {
            setClauses.push('priority = ?');
            params.push(updateData.priority);
        }
        if (updateData.assigned_to !== undefined) {
            setClauses.push('assigned_to = ?');
            params.push(updateData.assigned_to);
        }

        if (setClauses.length === 0) {
            return false; 
        }

        setClauses.push('updated_at = CURRENT_TIMESTAMP');
        params.push(ticket_id);
        const statement = `UPDATE supporttickets SET ${setClauses.join(', ')} WHERE ticket_id = ?`;
        const result = await db.connection?.run(statement, ...params);
        return (result?.changes ?? 0) > 0;
    },
    
    async deleteByID(ticket_id: number): Promise<void> {
        await db.connection?.run(
            'DELETE FROM supporttickets WHERE ticket_id = ?',
            ticket_id
        );
    },

    async bulkUpdateStatus(ticketIds: number[], status: TicketStatus): Promise<number> {
        if (ticketIds.length === 0) return 0;
        const placeholders = ticketIds.map(() => '?').join(',');
        const result = await db.connection?.run(
            `UPDATE supporttickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE ticket_id IN (${placeholders})`,
            status,
            ...ticketIds
        );
        return result?.changes ?? 0;
    },

    async bulkDelete(ticketIds: number[]): Promise<number> {
        if (ticketIds.length === 0) return 0;
        const placeholders = ticketIds.map(() => '?').join(',');
        const result = await db.connection?.run(
            `DELETE FROM supporttickets WHERE ticket_id IN (${placeholders})`,
            ...ticketIds
        );
        return result?.changes ?? 0;
    },

    async getWithFilters(filters?: {
        status?: TicketStatus;
        priority?: TicketPriority;
        assigned_to?: number;
        limit?: number;
        offset?: number;
    }): Promise<SupportTicket[]> {
        let query = `
            SELECT st.*, u.first_name, u.last_name, u.email,
                   a.first_name as assigned_first_name, a.last_name as assigned_last_name
            FROM supporttickets st
            JOIN users u ON st.user_id = u.user_id
            LEFT JOIN users a ON st.assigned_to = a.user_id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (filters?.status) {
            query += ' AND st.status = ?';
            params.push(filters.status);
        }
        if (filters?.priority) {
            query += ' AND st.priority = ?';
            params.push(filters.priority);
        }
        if (filters?.assigned_to !== undefined) {
            if (filters.assigned_to === null) {
                query += ' AND st.assigned_to IS NULL';
            } else {
                query += ' AND st.assigned_to = ?';
                params.push(filters.assigned_to);
            }
        }

        query += ' ORDER BY st.created_at DESC';

        if (filters?.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
            if (filters?.offset) {
                query += ' OFFSET ?';
                params.push(filters.offset);
            }
        }

        const result = await db.connection?.all<SupportTicket[]>(query, ...params);
        return result || [];
    }
}