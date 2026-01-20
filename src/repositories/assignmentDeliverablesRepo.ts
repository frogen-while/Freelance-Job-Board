import { db } from '../config/init_db.js';

export type AssignmentDeliverable = {
  deliverable_id: number;
  assignment_id: number;
  freelancer_id: number;
  file_path?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  link_url?: string | null;
  status?: 'submitted' | 'accepted' | 'changes_requested';
  reviewer_message?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
};

export const assignmentDeliverablesRepo = {
  async create(data: {
    assignment_id: number;
    freelancer_id: number;
    file_path?: string | null;
    file_name?: string | null;
    file_size?: number | null;
    mime_type?: string | null;
    link_url?: string | null;
    status?: 'submitted' | 'accepted' | 'changes_requested';
    reviewer_message?: string | null;
  }): Promise<number | null> {
    const result = await db.connection?.run(
      `INSERT INTO assignment_deliverables
        (assignment_id, freelancer_id, file_path, file_name, file_size, mime_type, link_url, status, reviewer_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      data.assignment_id,
      data.freelancer_id,
      data.file_path ?? null,
      data.file_name ?? null,
      data.file_size ?? null,
      data.mime_type ?? null,
      data.link_url ?? null,
      data.status ?? 'submitted',
      data.reviewer_message ?? null
    );
    return result?.lastID ?? null;
  },

  async getByAssignmentId(assignment_id: number): Promise<AssignmentDeliverable[]> {
    const result = await db.connection?.all<AssignmentDeliverable[]>(
      `SELECT * FROM assignment_deliverables WHERE assignment_id = ? ORDER BY created_at DESC`,
      assignment_id
    );
    return result || [];
  },

  async findById(deliverable_id: number): Promise<AssignmentDeliverable | undefined> {
    return await db.connection?.get<AssignmentDeliverable | undefined>(
      `SELECT * FROM assignment_deliverables WHERE deliverable_id = ?`,
      deliverable_id
    );
  },

  async updateStatus(deliverable_id: number, status: 'submitted' | 'accepted' | 'changes_requested', reviewer_message?: string | null): Promise<boolean> {
    const result = await db.connection?.run(
      `UPDATE assignment_deliverables SET status = ?, reviewer_message = ?, reviewed_at = CURRENT_TIMESTAMP WHERE deliverable_id = ?`,
      status,
      reviewer_message ?? null,
      deliverable_id
    );
    return (result?.changes ?? 0) > 0;
  }
};
