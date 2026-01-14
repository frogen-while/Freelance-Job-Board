
import { db } from '../config/init_db.js';
import { JobStatus, Job, JobType, ExperienceLevel, DurationEstimate } from '../interfaces/Job.js';
import { jobSkillsRepo } from './jobSkillsRepo.js';

export const jobRepo = {

    async get_all(): Promise<Job[]> {
        const result = await db.connection?.all<Job[]>(
            `SELECT job_id, employer_id, category_id, title, description, budget, status, deadline, 
                    experience_level, job_type, duration_estimate, is_remote, location 
             FROM jobs`
        );
        return result || [];
    },

    async getAllWithSkills(): Promise<Job[]> {
        const jobs = await this.get_all();
        for (const job of jobs) {
            job.skills = await jobSkillsRepo.getSkillNamesByJobId(job.job_id);
        }
        return jobs;
    },

    async create(data: {
        employer_id: number;
        category_id: number;
        title: string;
        description: string;
        budget: number;
        status?: JobStatus;
        deadline?: string;
        experience_level?: ExperienceLevel;
        job_type?: JobType;
        duration_estimate?: DurationEstimate;
        is_remote?: boolean;
        location?: string;
        skill_ids?: number[];
    }): Promise<number | null> {
        const result = await db.connection?.run(
            `INSERT INTO jobs (employer_id, category_id, title, description, budget, status, deadline, 
                               experience_level, job_type, duration_estimate, is_remote, location) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            data.employer_id, 
            data.category_id, 
            data.title, 
            data.description, 
            data.budget, 
            data.status || 'Open', 
            data.deadline || null,
            data.experience_level || null,
            data.job_type || 'fixed',
            data.duration_estimate || null,
            data.is_remote !== undefined ? (data.is_remote ? 1 : 0) : 1,
            data.location || null
        );
        
        const job_id = result?.lastID ?? null;

        // Add skills if provided
        if (job_id && data.skill_ids && data.skill_ids.length > 0) {
            await jobSkillsRepo.setJobSkills(job_id, data.skill_ids);
        }
            
        return job_id;
    },

    async findById(job_id: number): Promise<Job | undefined> {
        const job = await db.connection?.get<Job | undefined>(
            `SELECT * FROM jobs WHERE job_id = ?`,
            job_id
        );
        if (job) {
            job.skills = await jobSkillsRepo.getSkillNamesByJobId(job_id);
        }
        return job;
    },

    async findByEmployerId(employer_id: number): Promise<Job[]> {
        const jobs = await db.connection?.all<Job[]>(
            `SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC`,
            employer_id
        );
        if (jobs) {
            for (const job of jobs) {
                job.skills = await jobSkillsRepo.getSkillNamesByJobId(job.job_id);
            }
        }
        return jobs || [];
    },

    async update(job_id: number, updateData: { 
        employer_id?: number;
        category_id?: number;
        title?: string;
        description?: string;
        budget?: number;
        status?: JobStatus;
        deadline?: string;
        experience_level?: ExperienceLevel;
        job_type?: JobType;
        duration_estimate?: DurationEstimate;
        is_remote?: boolean;
        location?: string;
        skill_ids?: number[];
    }): Promise<boolean> {
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
        if (updateData.experience_level !== undefined) {
            setClauses.push('experience_level = ?');
            params.push(updateData.experience_level);
        }
        if (updateData.job_type !== undefined) {
            setClauses.push('job_type = ?');
            params.push(updateData.job_type);
        }
        if (updateData.duration_estimate !== undefined) {
            setClauses.push('duration_estimate = ?');
            params.push(updateData.duration_estimate);
        }
        if (updateData.is_remote !== undefined) {
            setClauses.push('is_remote = ?');
            params.push(updateData.is_remote ? 1 : 0);
        }
        if (updateData.location !== undefined) {
            setClauses.push('location = ?');
            params.push(updateData.location);
        }

        if (setClauses.length === 0 && !updateData.skill_ids) {
            return false; 
        }

        if (setClauses.length > 0) {
            setClauses.push('updated_at = CURRENT_TIMESTAMP');
            params.push(job_id);
            const statement = `UPDATE jobs SET ${setClauses.join(', ')} WHERE job_id = ?`;
            await db.connection?.run(statement, params);
        }

        // Update skills if provided
        if (updateData.skill_ids) {
            await jobSkillsRepo.setJobSkills(job_id, updateData.skill_ids);
        }

        return true;
    },

    async deleteByID(job_id: number): Promise<void> {
        await db.connection?.run(
            'DELETE FROM jobs WHERE job_id = ?',
            job_id
        );
    },

    async getByEmployerId(employer_id: number): Promise<Job[]> {
        const jobs = await db.connection?.all<Job[]>(
            `SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC`,
            employer_id
        );
        return jobs || [];
    },

    async getByCategoryId(category_id: number): Promise<Job[]> {
        const jobs = await db.connection?.all<Job[]>(
            `SELECT * FROM jobs WHERE category_id = ? ORDER BY created_at DESC`,
            category_id
        );
        return jobs || [];
    },

    async search(options: {
        query?: string;
        category_id?: number;
        status?: JobStatus;
        experience_level?: ExperienceLevel;
        job_type?: JobType;
        is_remote?: boolean;
        skill_ids?: number[];
        limit?: number;
        offset?: number;
    }): Promise<{ jobs: Job[]; total: number }> {
        const limit = options.limit ?? 20;
        const offset = options.offset ?? 0;

        let whereConditions: string[] = [];
        const params: (string | number)[] = [];

        if (options.query) {
            whereConditions.push(`(j.title LIKE ? OR j.description LIKE ?)`);
            params.push(`%${options.query}%`, `%${options.query}%`);
        }

        if (options.category_id) {
            whereConditions.push(`j.category_id = ?`);
            params.push(options.category_id);
        }

        if (options.status) {
            whereConditions.push(`j.status = ?`);
            params.push(options.status);
        }

        if (options.experience_level) {
            whereConditions.push(`j.experience_level = ?`);
            params.push(options.experience_level);
        }

        if (options.job_type) {
            whereConditions.push(`j.job_type = ?`);
            params.push(options.job_type);
        }

        if (options.is_remote !== undefined) {
            whereConditions.push(`j.is_remote = ?`);
            params.push(options.is_remote ? 1 : 0);
        }

        if (options.skill_ids && options.skill_ids.length > 0) {
            whereConditions.push(`js.skill_id IN (${options.skill_ids.map(() => '?').join(',')})`);
            params.push(...options.skill_ids);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Count total
        const countQuery = `
            SELECT COUNT(DISTINCT j.job_id) as total
            FROM jobs j
            LEFT JOIN job_skills js ON j.job_id = js.job_id
            ${whereClause}
        `;
        const countResult = await db.connection?.get<{ total: number }>(countQuery, ...params);
        const total = countResult?.total ?? 0;

        // Get jobs
        const query = `
            SELECT DISTINCT j.*
            FROM jobs j
            LEFT JOIN job_skills js ON j.job_id = js.job_id
            ${whereClause}
            ORDER BY j.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const jobs = await db.connection?.all<Job[]>(query, ...params, limit, offset);

        // Add skills to each job
        for (const job of jobs || []) {
            job.skills = await jobSkillsRepo.getSkillNamesByJobId(job.job_id);
        }

        return { jobs: jobs || [], total };
    }
}