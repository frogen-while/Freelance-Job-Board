import { db } from '../config/init_db.js';
import { Review, Rating } from '../interfaces/Jobreview.js';

export const reviewRepo = {
    async get_all(): Promise<Review[]> {
        const result = await db.connection?.all<Review[]>(
            `SELECT * FROM reviews ORDER BY created_at DESC`
        );
        return result || [];
    },

    async findByJob(job_id: number): Promise<Review[]> {
        const result = await db.connection?.all<Review[]>(
            `SELECT * FROM reviews WHERE job_id = ?`,
            job_id
        );
        return result || [];
    },

    async findByReviewer(reviewer_id: number): Promise<Review[]> {
        const result = await db.connection?.all<Review[]>(
            `SELECT * FROM reviews WHERE reviewer_id = ? ORDER BY created_at DESC`,
            reviewer_id
        );
        return result || [];
    },

    async findByReviewee(reviewee_id: number): Promise<Review[]> {
        const result = await db.connection?.all<Review[]>(
            `SELECT r.*, 
                    u.first_name || ' ' || u.last_name as reviewer_name,
                    j.title as job_title
             FROM reviews r
             LEFT JOIN users u ON r.reviewer_id = u.user_id
             LEFT JOIN jobs j ON r.job_id = j.job_id
             WHERE r.reviewee_id = ? 
             ORDER BY r.created_at DESC`,
            reviewee_id
        );
        return result || [];
    },

    async create(data: {
        job_id: number;
        reviewer_id: number;
        reviewee_id: number;
        rating: Rating;
        feedback?: string;
    }): Promise<number | null> {
        const result = await db.connection?.run(
            `INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, feedback) 
             VALUES (?, ?, ?, ?, ?)`,
            data.job_id,
            data.reviewer_id,
            data.reviewee_id,
            data.rating,
            data.feedback || null
        );
        return result?.lastID ?? null;
    },

    async findById(review_id: number): Promise<Review | undefined> {
        return await db.connection?.get<Review | undefined>(
            `SELECT * FROM reviews WHERE review_id = ?`,
            review_id
        );
    },

    async update(review_id: number, updateData: Partial<Omit<Review, 'review_id' | 'created_at' | 'job_id' | 'reviewer_id' | 'reviewee_id'>>): Promise<boolean> {
        const setClauses: string[] = [];
        const params: (string | number | null)[] = [];

        const fields: (keyof typeof updateData)[] = ['rating', 'feedback'];

        for (const field of fields) {
            if (updateData[field] !== undefined) {
                setClauses.push(`${field} = ?`);
                params.push(updateData[field] as string | number | null);
            }
        }

        if (setClauses.length === 0) return false;

        params.push(review_id);
        const statement = `UPDATE reviews SET ${setClauses.join(', ')} WHERE review_id = ?`;
        const result = await db.connection?.run(statement, params);
        return (result?.changes ?? 0) > 0;
    },

    async deleteById(review_id: number): Promise<void> {
        await db.connection?.run('DELETE FROM reviews WHERE review_id = ?', review_id);
    },

    async getAverageRating(reviewee_id: number): Promise<number | null> {
        const result = await db.connection?.get<{ avg_rating: number }>(
            `SELECT AVG(rating) as avg_rating FROM reviews WHERE reviewee_id = ?`,
            reviewee_id
        );
        return result?.avg_rating ?? null;
    },

    async getReviewCount(reviewee_id: number): Promise<number> {
        const result = await db.connection?.get<{ count: number }>(
            `SELECT COUNT(*) as count FROM reviews WHERE reviewee_id = ?`,
            reviewee_id
        );
        return result?.count ?? 0;
    },

    async hasReviewed(job_id: number, reviewer_id: number): Promise<boolean> {
        const result = await db.connection?.get<{ count: number }>(
            `SELECT COUNT(*) as count FROM reviews WHERE job_id = ? AND reviewer_id = ?`,
            job_id, reviewer_id
        );
        return (result?.count ?? 0) > 0;
    }
};
