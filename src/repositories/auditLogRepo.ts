import { db } from '../config/init_db.js';

export interface AuditLogEntry {
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
}

export interface AuditLog extends AuditLogEntry {
  log_id: number;
  created_at: string;
}

export const auditLogRepo = {
  async logAction(entry: AuditLogEntry): Promise<number | null> {
    try {
      const result = await db.connection?.run(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        entry.user_id,
        entry.action,
        entry.entity_type,
        entry.entity_id,
        entry.old_value ? JSON.stringify(entry.old_value) : null,
        entry.new_value ? JSON.stringify(entry.new_value) : null,
        entry.ip_address || null
      );
      return result?.lastID ?? null;
    } catch (error) {
      console.error('Failed to log audit action:', error);
      return null;
    }
  },

  async getLogs(filters?: {
    user_id?: number;
    entity_type?: string;
    action?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]> {
    let query = `
      SELECT al.*, u.first_name, u.last_name, u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.user_id) {
      query += ' AND al.user_id = ?';
      params.push(filters.user_id);
    }
    if (filters?.entity_type) {
      query += ' AND al.entity_type = ?';
      params.push(filters.entity_type);
    }
    if (filters?.action) {
      query += ' AND al.action = ?';
      params.push(filters.action);
    }

    query += ' ORDER BY al.created_at DESC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
      if (filters?.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    const result = await db.connection?.all<AuditLog[]>(query, ...params);
    return result || [];
  },

  async getLogsCount(filters?: {
    user_id?: number;
    entity_type?: string;
    action?: string;
  }): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    if (filters?.user_id) {
      query += ' AND user_id = ?';
      params.push(filters.user_id);
    }
    if (filters?.entity_type) {
      query += ' AND entity_type = ?';
      params.push(filters.entity_type);
    }
    if (filters?.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }

    const result = await db.connection?.get<{ count: number }>(query, ...params);
    return result?.count || 0;
  }
};

export const AuditActions = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  ROLE_CHANGE: 'ROLE_CHANGE',
  USER_BLOCKED: 'USER_BLOCKED',
  USER_UNBLOCKED: 'USER_UNBLOCKED',
  USER_CREATED: 'USER_CREATED',
  USER_DELETED: 'USER_DELETED',
  BULK_BLOCK: 'BULK_BLOCK',
  BULK_UNBLOCK: 'BULK_UNBLOCK',
  BULK_ROLE_CHANGE: 'BULK_ROLE_CHANGE',
  JOB_CREATED: 'JOB_CREATED',
  JOB_UPDATED: 'JOB_UPDATED',
  JOB_DELETED: 'JOB_DELETED',
  JOB_STATUS_CHANGED: 'JOB_STATUS_CHANGED',
  JOB_HIDDEN: 'JOB_HIDDEN',
  JOB_RESTORED: 'JOB_RESTORED',
  BID_CREATED: 'BID_CREATED',
  BID_ACCEPTED: 'BID_ACCEPTED',
  BID_REJECTED: 'BID_REJECTED',
  CONTRACT_CREATED: 'CONTRACT_CREATED',
  CONTRACT_COMPLETED: 'CONTRACT_COMPLETED',
  CONTRACT_CANCELLED: 'CONTRACT_CANCELLED',
  TICKET_CREATED: 'TICKET_CREATED',
  TICKET_STATUS_CHANGED: 'TICKET_STATUS_CHANGED',
  TICKET_ESCALATED: 'TICKET_ESCALATED',
  TICKET_DELETED: 'TICKET_DELETED',
  TICKET_ASSIGNED: 'TICKET_ASSIGNED',
  TICKET_NOTE_ADDED: 'TICKET_NOTE_ADDED',
  TICKET_PRIORITY_CHANGED: 'TICKET_PRIORITY_CHANGED',
  BULK_TICKET_STATUS: 'BULK_TICKET_STATUS',
  BULK_TICKET_DELETE: 'BULK_TICKET_DELETE',
  CATEGORY_CREATED: 'CATEGORY_CREATED',
  CATEGORY_UPDATED: 'CATEGORY_UPDATED',
  CATEGORY_DELETED: 'CATEGORY_DELETED',
  SKILL_CREATED: 'SKILL_CREATED',
  SKILL_DELETED: 'SKILL_DELETED',
  SETTING_CHANGED: 'SETTING_CHANGED'
} as const;

export const EntityTypes = {
  USER: 'user',
  JOB: 'job',
  BID: 'bid',
  CONTRACT: 'contract',
  TICKET: 'support_ticket',
  CATEGORY: 'category',
  SKILL: 'skill',
  PAYMENT: 'payment',
  REVIEW: 'review',
  SETTING: 'setting'
} as const;
