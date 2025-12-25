
import { db } from '../config/init_db.js';
import { status, Job } from '../interfaces/Job.js';

export const jobRepo = {

    async get_all(): Promise<Job[]> {
                const result = await db.connection?.all<Job[]>(
                    'SELECT job_id, employer_id, category_id, title, description, budget, status, deadline FROM jobs'
                );
                return result || [];
            },
    async create(employer_id: number, category_id: number, title: string, description: string, budget: number, status: status, deadline: string): Promise<number | null> {
        const result = await db.connection?.run(
                `INSERT INTO jobs (employer_id, category_id, title, description, budget, status, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                employer_id, category_id, title, description, budget, status, deadline
            );
            
            return result?.lastID ?? null;

    },
    async findById(job_id: number): Promise<Job | undefined> {
            return await db.connection?.get<Job | undefined>(
                `SELECT * FROM jobs WHERE job_id = ?`,
                job_id
            )},
    async update(job_id: number, updateData: { employer_id?: number, category_id?: number, title?: string, description?: string, budget?: number, status?: status, deadline?: string}): Promise<boolean> {
        const setClauses: string[] = [];
        const params: (string | number | null)[] = [];

        if (updateData.employer_id !== undefined) {
            setClauses.push('employer_id = ?');
            params.push(updateData.employer_id);
        }
        if (updateData.category_id !== undefined) {
            setClauses.push('category_id = ?');
            params.push(updateData.category_id);
        }
        if (updateData.title !== undefined) {
            setClauses.push('title = ?');
            params.push(updateData.title);
        }
        if (updateData.description !== undefined) {
            setClauses.push('description = ?');
            params.push(updateData.description);
        }
        if (updateData.budget !== undefined) {
            setClauses.push('budget = ?');
            params.push(updateData.budget);
        }
        if (updateData.status !== undefined) {
            setClauses.push('status = ?');
            params.push(updateData.status);
        }
        if (updateData.deadline !== undefined) {
            setClauses.push('deadline = ?');
            params.push(updateData.deadline);
        }

        if (setClauses.length === 0) {
            return false; 
        }

        params.push(job_id);
        const statement = `UPDATE jobs SET ${setClauses.join(', ')} WHERE job_id = ?`;
        const result = await db.connection?.run(statement, params);
        return (result?.changes ?? 0) > 0;
    },
    async deleteByID(job_id: number): Promise<void> {
        await db.connection?.run(
            'DELETE FROM jobs WHERE job_id = ?',
            job_id
        );
    }

}