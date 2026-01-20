import { db } from '../config/init_db.js';

export interface TicketReply {
  reply_id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export interface TicketReplyWithUser extends TicketReply {
  first_name: string;
  last_name: string;
  email: string;
  main_role: string;
}

export const ticketRepliesRepo = {
  async create(ticketId: number, userId: number, message: string, isInternal: boolean = false, isStaff: boolean = false): Promise<number | null> {
    // Staff replies use user_id = -1 for anonymity
    const effectiveUserId = isStaff ? -1 : userId;
    const result = await db.connection?.run(
      'INSERT INTO ticket_replies (ticket_id, user_id, message, is_internal) VALUES (?, ?, ?, ?)',
      ticketId, effectiveUserId, message, isInternal ? 1 : 0
    );
    return result?.lastID ?? null;
  },

  async findById(replyId: number): Promise<TicketReply | undefined> {
    return await db.connection?.get<TicketReply>(
      'SELECT * FROM ticket_replies WHERE reply_id = ?',
      replyId
    );
  },

  async getByTicketId(ticketId: number, includeInternal: boolean = true): Promise<TicketReplyWithUser[]> {
    const internalFilter = includeInternal ? '' : 'AND tr.is_internal = 0';
    const result = await db.connection?.all<TicketReplyWithUser[]>(
      `SELECT tr.reply_id, tr.ticket_id, tr.user_id, tr.message, tr.is_internal, tr.created_at,
              CASE WHEN tr.user_id = -1 THEN st.subject ELSE u.first_name END as first_name,
              CASE WHEN tr.user_id = -1 THEN '' ELSE u.last_name END as last_name,
              CASE WHEN tr.user_id = -1 THEN 'support@platform.com' ELSE u.email END as email,
              CASE WHEN tr.user_id = -1 THEN 'Support' ELSE u.main_role END as main_role
       FROM ticket_replies tr
       LEFT JOIN users u ON tr.user_id = u.user_id
       LEFT JOIN supporttickets st ON tr.ticket_id = st.ticket_id
       WHERE tr.ticket_id = ? ${internalFilter}
       ORDER BY tr.created_at ASC`,
      ticketId
    );
    return result || [];
  },

  async delete(replyId: number): Promise<boolean> {
    const result = await db.connection?.run(
      'DELETE FROM ticket_replies WHERE reply_id = ?',
      replyId
    );
    return (result?.changes ?? 0) > 0;
  },

  async getCountByTicketId(ticketId: number): Promise<number> {
    const result = await db.connection?.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM ticket_replies WHERE ticket_id = ?',
      ticketId
    );
    return result?.count || 0;
  }
};
