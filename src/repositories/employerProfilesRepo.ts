import { db } from '../config/init_db.js';
import { EmployerProfile, EmployerProfileFull, CompanySize } from '../interfaces/EmployerProfile.js';

interface EmployerProfileRow {
  id: number;
  user_id: number;
  company_name: string | null;
  company_description: string | null;
  company_website: string | null;
  company_size: string | null;
  industry: string | null;
  jobs_posted: number;
  total_spent: number;

  first_name?: string;
  last_name?: string;
  email?: string;
  display_name?: string | null;
  headline?: string | null;
  description?: string | null;
  photo_url?: string | null;
  location?: string | null;
}

export const employerProfilesRepo = {
  async findByUserId(user_id: number): Promise<EmployerProfile | undefined> {
    const row = await db.connection?.get<EmployerProfileRow | undefined>(
      `SELECT * FROM employer_profiles WHERE user_id = ?`,
      user_id
    );
    if (!row) return undefined;
    return row as EmployerProfile;
  },

  async findFullByUserId(user_id: number): Promise<EmployerProfileFull | undefined> {
    const row = await db.connection?.get<EmployerProfileRow | undefined>(
      `SELECT
        ep.*,
        u.first_name,
        u.last_name,
        u.email,
        p.display_name,
        p.headline,
        p.description,
        p.photo_url,
        p.location
      FROM employer_profiles ep
      INNER JOIN users u ON ep.user_id = u.user_id
      LEFT JOIN profiles p ON ep.user_id = p.user_id
      WHERE ep.user_id = ?`,
      user_id
    );

    if (!row) return undefined;

    return {
      ...row,
      first_name: row.first_name!,
      last_name: row.last_name!,
      email: row.email!
    } as EmployerProfileFull;
  },

  async upsert(user_id: number, data: {
    company_name?: string | null;
    company_description?: string | null;
    company_website?: string | null;
    company_size?: CompanySize | null;
    industry?: string | null;
  }): Promise<void> {
    await db.connection?.run(
      `INSERT INTO employer_profiles (user_id, company_name, company_description, company_website, company_size, industry)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         company_name = COALESCE(excluded.company_name, employer_profiles.company_name),
         company_description = COALESCE(excluded.company_description, employer_profiles.company_description),
         company_website = COALESCE(excluded.company_website, employer_profiles.company_website),
         company_size = COALESCE(excluded.company_size, employer_profiles.company_size),
         industry = COALESCE(excluded.industry, employer_profiles.industry),
         updated_at = CURRENT_TIMESTAMP`,
      user_id,
      data.company_name,
      data.company_description,
      data.company_website,
      data.company_size,
      data.industry
    );
  },

  async incrementJobsPosted(user_id: number): Promise<void> {
    await db.connection?.run(
      `UPDATE employer_profiles SET jobs_posted = jobs_posted + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      user_id
    );
  },

  async addToTotalSpent(user_id: number, amount: number): Promise<void> {
    await db.connection?.run(
      `UPDATE employer_profiles SET total_spent = total_spent + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      amount,
      user_id
    );
  },

  async getAll(options?: {
    industry?: string;
    company_size?: CompanySize;
    limit?: number;
    offset?: number;
  }): Promise<{ employers: EmployerProfileFull[]; total: number }> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    let whereConditions: string[] = ['u.is_blocked = 0'];
    const params: (string | number)[] = [];

    if (options?.industry) {
      whereConditions.push(`ep.industry LIKE ?`);
      params.push(`%${options.industry}%`);
    }

    if (options?.company_size) {
      whereConditions.push(`ep.company_size = ?`);
      params.push(options.company_size);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) as total
      FROM employer_profiles ep
      INNER JOIN users u ON ep.user_id = u.user_id
      ${whereClause}
    `;
    const countResult = await db.connection?.get<{ total: number }>(countQuery, ...params);
    const total = countResult?.total ?? 0;

    const query = `
      SELECT
        ep.*,
        u.first_name,
        u.last_name,
        u.email,
        p.display_name,
        p.headline,
        p.description,
        p.photo_url,
        p.location
      FROM employer_profiles ep
      INNER JOIN users u ON ep.user_id = u.user_id
      LEFT JOIN profiles p ON ep.user_id = p.user_id
      ${whereClause}
      ORDER BY ep.jobs_posted DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await db.connection?.all<EmployerProfileRow[]>(query, ...params, limit, offset);

    const employers: EmployerProfileFull[] = (rows || []).map(row => ({
      ...row,
      company_size: row.company_size as CompanySize | null | undefined,
      first_name: row.first_name!,
      last_name: row.last_name!,
      email: row.email!
    }));

    return { employers, total };
  }
};
