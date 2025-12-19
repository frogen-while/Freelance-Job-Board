import { db } from '../config/init_db.js';
import { status, Assignment } from '../interfaces/Assignment.js';

export const assignmentRepo = {

    async get_all(): Promise<Assignment[]> {
        const result = await db.connection?.all<Assignment[]>(
            'SELECT assignment_id, job_id, freelancer_id, status FROM assignments'
        );
        return result || [];
    },
    
    async create(job_id: number, freelancer_id: number, status: status): Promise<number | null> {
        const result = await db.connection?.run(
            `INSERT INTO assignments (job_id, freelancer_id, status) VALUES (?, ?, ?)`,
            job_id, freelancer_id, status
        );
        
        return result?.lastID ?? null;
    },
    
    async findById(assignment_id: number): Promise<Assignment | undefined> {
        return await db.connection?.get<Assignment | undefined>(
            `SELECT * FROM assignments WHERE assignment_id = ?`,
            assignment_id
        );
    },
    
    async update(assignment_id: number, updateData: { job_id?: number, freelancer_id?: number, status?: status}): Promise<boolean> {
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
        if (updateData.status !== undefined) {
            setClauses.push('status = ?');
            params.push(updateData.status);
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
    }

}