import { db } from '../config/init_db.js';

export interface JobFlag {
  flag_id: number;
  job_id: number;
  flagged_by: number;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
}

export const jobFlagsRepo = {
  async create(jobId: number, flaggedBy: number, reason: string): Promise<number | null> {
    const result = await db.connection?.run(
      'INSERT INTO job_flags (job_id, flagged_by, reason) VALUES (?, ?, ?)',
      jobId, flaggedBy, reason
    );
    return result?.lastID ?? null;
  },

  async findById(flagId: number): Promise<JobFlag | undefined> {
    return await db.connection?.get<JobFlag>(
      'SELECT * FROM job_flags WHERE flag_id = ?',
      flagId
    );
  },

  async getByJobId(jobId: number): Promise<JobFlag[]> {
    const result = await db.connection?.all<JobFlag[]>(
      `SELECT jf.*, u.first_name, u.last_name, u.email
       FROM job_flags jf
       JOIN users u ON jf.flagged_by = u.user_id
       WHERE jf.job_id = ?
       ORDER BY jf.created_at DESC`,
      jobId
    );
    return result || [];
  },

  async getPending(limit = 50, offset = 0): Promise<JobFlag[]> {
    const result = await db.connection?.all<JobFlag[]>(
      `SELECT jf.*, j.title as job_title, u.first_name, u.last_name
       FROM job_flags jf
       JOIN jobs j ON jf.job_id = j.job_id
       JOIN users u ON jf.flagged_by = u.user_id
       WHERE jf.status = 'pending'
       ORDER BY jf.created_at DESC
       LIMIT ? OFFSET ?`,
      limit, offset
    );
    return result || [];
  },

  async getPendingCount(): Promise<number> {
    const result = await db.connection?.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM job_flags WHERE status = 'pending'"
    );
    return result?.count || 0;
  },

  async updateStatus(flagId: number, status: 'reviewed' | 'dismissed', reviewedBy: number): Promise<boolean> {
    const result = await db.connection?.run(
      'UPDATE job_flags SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ? WHERE flag_id = ?',
      status, reviewedBy, flagId
    );
    return (result?.changes ?? 0) > 0;
  },

  async hideJob(jobId: number, reason: string, hiddenBy: number): Promise<boolean> {
    const result = await db.connection?.run(
      `UPDATE jobs SET is_hidden = 1, hidden_reason = ?, hidden_at = CURRENT_TIMESTAMP, hidden_by = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?`,
      reason, hiddenBy, jobId
    );
    return (result?.changes ?? 0) > 0;
  },

  async restoreJob(jobId: number): Promise<boolean> {
    const result = await db.connection?.run(
      `UPDATE jobs SET is_hidden = 0, hidden_reason = NULL, hidden_at = NULL, hidden_by = NULL, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?`,
      jobId
    );
    return (result?.changes ?? 0) > 0;
  },

  async getHiddenJobs(limit = 50, offset = 0): Promise<any[]> {
    const result = await db.connection?.all(
      `SELECT j.*, u.first_name as hidden_by_name, u.last_name as hidden_by_lastname
       FROM jobs j
       LEFT JOIN users u ON j.hidden_by = u.user_id
       WHERE j.is_hidden = 1
       ORDER BY j.hidden_at DESC
       LIMIT ? OFFSET ?`,
      limit, offset
    );
    return result || [];
  },

  async getHiddenCount(): Promise<number> {
    const result = await db.connection?.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM jobs WHERE is_hidden = 1'
    );
    return result?.count || 0;
  }
};
