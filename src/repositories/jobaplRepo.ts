import { db } from '../config/init_db.js';
import { JobApplicationStatus, JobApl } from '../interfaces/jobapl.js';

export const jobAplRepo = {

    async get_all(): Promise<JobApl[]> {
                const result = await db.connection?.all<JobApl[]>(
                    'SELECT application_id, job_id, freelancer_id, bid_amount, proposal_text, status FROM jobapplications'
                );
                return result || [];
            },
    async create(job_id: number, freelancer_id: number, bid_amount:number, proposal_text:string, status:JobApplicationStatus): Promise<number | null> {
        const result = await db.connection?.run(
                `INSERT INTO jobapplications (job_id, freelancer_id, bid_amount, proposal_text, status) VALUES (?, ?, ?, ?, ?)`,
                job_id, freelancer_id, bid_amount, proposal_text, status
            );
            
            return result?.lastID ?? null;

    },
    async findById(application_id: number): Promise<JobApl | undefined> {
            return await db.connection?.get<JobApl | undefined>(
                `SELECT * FROM jobapplications WHERE application_id = ?`,
                application_id
            )},

    async findByIdWithDetails(application_id: number): Promise<JobApl | undefined> {
        return await db.connection?.get<JobApl | undefined>(
            `SELECT ja.*, u.first_name, u.last_name, u.email,
                    p.display_name, p.headline, p.photo_url,
                    fp.hourly_rate, fp.experience_level
             FROM jobapplications ja
             LEFT JOIN users u ON ja.freelancer_id = u.user_id
             LEFT JOIN profiles p ON ja.freelancer_id = p.user_id
             LEFT JOIN freelancer_profiles fp ON ja.freelancer_id = fp.user_id
             WHERE ja.application_id = ?`,
            application_id
        );
    },

    async update(application_id: number, updateData: { job_id?: number, freelancer_id?: number, bid_amount?:number, proposal_text?:string, status?:JobApplicationStatus}): Promise<boolean> {
        const setClauses: string[] = [];
        const params: (string | number | null)[] = [];

        if (updateData.job_id !== undefined) {
            setClauses.push('job_id = ?');
            params.push(updateData.job_id);
        }
        if (updateData.freelancer_id !== undefined) {
            setClauses.push('freelancer_id = ?');
            params.push(updateData.freelancer_id);
        }
        if (updateData.bid_amount !== undefined) {
            setClauses.push('bid_amount = ?');
            params.push(updateData.bid_amount);
        }
        if (updateData.proposal_text !== undefined) {
            setClauses.push('proposal_text = ?');
            params.push(updateData.proposal_text);
        }
        if (updateData.status !== undefined) {
            setClauses.push('status = ?');
            params.push(updateData.status);
        }

        if (setClauses.length === 0) {
            return false; 
        }

        params.push(application_id);
        const statement = `UPDATE jobapplications SET ${setClauses.join(', ')} WHERE application_id = ?`;
        const result = await db.connection?.run(statement, params);
        return (result?.changes ?? 0) > 0;
    },
    async deleteByID(application_id: number): Promise<void> {
        await db.connection?.run(
            'DELETE FROM jobapplications WHERE application_id = ?',
            application_id
        );
    },

    async findByJobId(job_id: number): Promise<JobApl[]> {
        const result = await db.connection?.all<JobApl[]>(
            `SELECT ja.*, u.first_name, u.last_name, u.email,
                    p.display_name, p.headline, p.photo_url,
                    fp.hourly_rate, fp.experience_level
             FROM jobapplications ja
             LEFT JOIN users u ON ja.freelancer_id = u.user_id
             LEFT JOIN profiles p ON ja.freelancer_id = p.user_id
             LEFT JOIN freelancer_profiles fp ON ja.freelancer_id = fp.user_id
             WHERE ja.job_id = ?
             ORDER BY ja.created_at DESC`,
            job_id
        );
        return result || [];
    },

    async findByFreelancerId(freelancer_id: number): Promise<JobApl[]> {
        const result = await db.connection?.all<JobApl[]>(
            `SELECT ja.*, j.title as job_title, j.budget as job_budget, j.status as job_status
             FROM jobapplications ja
             LEFT JOIN jobs j ON ja.job_id = j.job_id
             WHERE ja.freelancer_id = ?
             ORDER BY ja.created_at DESC`,
            freelancer_id
        );
        return result || [];
    }

}