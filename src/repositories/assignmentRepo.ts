import { db } from '../config/init_db.js';
import { Assignment } from '../interfaces/Assignment.js';

export const assignmentRepo = {

    async get_all(): Promise<Assignment[]> {
        const result = await db.connection?.all<Assignment[]>(
            'SELECT assignment_id, job_id, freelancer_id, status, created_at, updated_at FROM assignments'
        );
        return result || [];
    },

    async create(job_id: number, freelancer_id: number): Promise<number | null> {
        const result = await db.connection?.run(
            `INSERT INTO assignments (job_id, freelancer_id) VALUES (?, ?)`,
            job_id, freelancer_id
        );

        return result?.lastID ?? null;
    },

    async findById(assignment_id: number): Promise<Assignment | undefined> {
        return await db.connection?.get<Assignment | undefined>(
            `SELECT * FROM assignments WHERE assignment_id = ?`,
            assignment_id
        );
    },

    async update(assignment_id: number, updateData: { job_id?: number, freelancer_id?: number }): Promise<boolean> {
        const setClauses: string[] = [];
        const params: (string | number)[] = [];

        if (updateData.job_id !== undefined) {
            setClauses.push('job_id = ?');
            params.push(updateData.job_id);
        }
        if (updateData.freelancer_id !== undefined) {
            setClauses.push('freelancer_id = ?');
            params.push(updateData.freelancer_id);
        }

        if (setClauses.length === 0) {
            return false;
        }

        params.push(assignment_id);
        const statement = `UPDATE assignments SET ${setClauses.join(', ')} WHERE assignment_id = ?`;
        const result = await db.connection?.run(statement, params);
        return (result?.changes ?? 0) > 0;
    },

    async deleteByID(assignment_id: number): Promise<void> {
        await db.connection?.run(
            'DELETE FROM assignments WHERE assignment_id = ?',
            assignment_id
        );
    },

    async findByFreelancerId(freelancer_id: number): Promise<Assignment[]> {
        const result = await db.connection?.all<Assignment[]>(
            `SELECT a.*, j.title as job_title, j.budget as job_budget, j.status as job_status
             FROM assignments a
             LEFT JOIN jobs j ON a.job_id = j.job_id
             WHERE a.freelancer_id = ?
             ORDER BY a.created_at DESC`,
            freelancer_id
        );
        return result || [];
    },

    async findByEmployerId(employer_id: number): Promise<Assignment[]> {
        const result = await db.connection?.all<Assignment[]>(
            `SELECT a.*, j.title as job_title, j.budget as job_budget, j.status as job_status,
                    u.first_name as freelancer_first_name, u.last_name as freelancer_last_name
             FROM assignments a
             LEFT JOIN jobs j ON a.job_id = j.job_id
             LEFT JOIN users u ON a.freelancer_id = u.user_id
             WHERE j.employer_id = ?
             ORDER BY a.created_at DESC`,
            employer_id
        );
        return result || [];
    },

    async updateStatus(assignment_id: number, status: 'Active' | 'Completed' | 'Terminated'): Promise<boolean> {
        const result = await db.connection?.run(
            `UPDATE assignments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE assignment_id = ?`,
            status, assignment_id
        );
        return (result?.changes ?? 0) > 0;
    }

}