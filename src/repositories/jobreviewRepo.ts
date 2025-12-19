import { db } from '../config/init_db.js';
import { rating, JobReview } from '../interfaces/Jobreview.js';

export const jobAplRepo = {

    async get_all(): Promise<JobReview[]> {
                const result = await db.connection?.all<JobReview[]>(
                    'SELECT review_id, job_id, reviewer_id, rating, feedback FROM jobreviews'
                );
                return result || [];
            },
    async create(job_id: number, reviewer_id: number, rating:rating, feedback:string): Promise<number | null> {
        const result = await db.connection?.run(
                `INSERT INTO jobreviews (job_id, reviewer_id, rating, feedback) VALUES (?, ?, ?, ?)`,
                job_id, reviewer_id, rating, feedback
            );
            
            return result?.lastID ?? null;

    },
    async findById(review_id: number): Promise<JobReview | undefined> {
            return await db.connection?.get<JobReview | undefined>(
                `SELECT * FROM jobreviews WHERE review_id = ?`,
                review_id
            )},
    async update(review_id: number, updateData: { job_id?: number, reviewer_id?: number, rating?:rating, feedback?:string}): Promise<boolean> {
        const setClauses: string[] = [];
        const params: (string | number | null | Date)[] = [];

        if (updateData.job_id !== undefined) {
            setClauses.push('job_id = ?');
            params.push(updateData.job_id);
        }
        if (updateData.reviewer_id !== undefined) {
            setClauses.push('reviewer_id = ?');
            params.push(updateData.reviewer_id);
        }
        if (updateData.rating !== undefined) {
            setClauses.push('rating = ?');
            params.push(updateData.rating);
        }
        if (updateData.feedback !== undefined) {
            setClauses.push('feedback = ?');
            params.push(updateData.feedback);
        }

        if (setClauses.length === 0) {
            return false; 
        }

        params.push(review_id);
        const statement = `UPDATE jobreviews SET ${setClauses.join(', ')} WHERE review_id = ?`;
        const result = await db.connection?.run(statement, params);
        return (result?.changes ?? 0) > 0;
    },
    async deleteByID(review_id: number): Promise<void> {
        await db.connection?.run(
            'DELETE FROM jobreviews WHERE review_id = ?',
            review_id
        );
    }

}