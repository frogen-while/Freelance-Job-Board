import { db } from '../config/init_db.js';
import { FreelancerProfile, FreelancerProfileFull, ExperienceLevel } from '../interfaces/FreelancerProfile.js';

interface FreelancerProfileRow {
  id: number;
  user_id: number;
  title: string | null;
  hourly_rate: number | null;
  experience_level: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  jobs_completed: number;
  rating: number;
  reviews_count: number;
  // From joins
  first_name?: string;
  last_name?: string;
  email?: string;
  display_name?: string | null;
  headline?: string | null;
  description?: string | null;
  photo_url?: string | null;
  location?: string | null;
  skill_names?: string | null;
}

export const freelancerProfilesRepo = {
  async findByUserId(user_id: number): Promise<FreelancerProfile | undefined> {
    const row = await db.connection?.get<FreelancerProfileRow | undefined>(
      `SELECT * FROM freelancer_profiles WHERE user_id = ?`,
      user_id
    );
    if (!row) return undefined;
    return row as FreelancerProfile;
  },

  async findFullByUserId(user_id: number): Promise<FreelancerProfileFull | undefined> {
    const row = await db.connection?.get<FreelancerProfileRow | undefined>(
      `SELECT 
        fp.*,
        u.first_name,
        u.last_name,
        u.email,
        p.display_name,
        p.headline,
        p.description,
        p.photo_url,
        p.location,
        GROUP_CONCAT(s.name) as skill_names
      FROM freelancer_profiles fp
      INNER JOIN users u ON fp.user_id = u.user_id
      LEFT JOIN profiles p ON fp.user_id = p.user_id
      LEFT JOIN profile_skills ps ON fp.user_id = ps.user_id
      LEFT JOIN skills s ON ps.skill_id = s.skill_id
      WHERE fp.user_id = ?
      GROUP BY fp.id`,
      user_id
    );

    if (!row) return undefined;

    return {
      ...row,
      first_name: row.first_name!,
      last_name: row.last_name!,
      email: row.email!,
      skills: row.skill_names ? row.skill_names.split(',') : []
    } as FreelancerProfileFull;
  },

  async upsert(user_id: number, data: {
    title?: string | null;
    hourly_rate?: number | null;
    experience_level?: ExperienceLevel | null;
    github_url?: string | null;
    linkedin_url?: string | null;
  }): Promise<void> {
    await db.connection?.run(
      `INSERT INTO freelancer_profiles (user_id, title, hourly_rate, experience_level, github_url, linkedin_url)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         title = COALESCE(excluded.title, freelancer_profiles.title),
         hourly_rate = COALESCE(excluded.hourly_rate, freelancer_profiles.hourly_rate),
         experience_level = COALESCE(excluded.experience_level, freelancer_profiles.experience_level),
         github_url = COALESCE(excluded.github_url, freelancer_profiles.github_url),
         linkedin_url = COALESCE(excluded.linkedin_url, freelancer_profiles.linkedin_url),
         updated_at = CURRENT_TIMESTAMP`,
      user_id,
      data.title,
      data.hourly_rate,
      data.experience_level,
      data.github_url,
      data.linkedin_url
    );
  },

  async incrementJobsCompleted(user_id: number): Promise<void> {
    await db.connection?.run(
      `UPDATE freelancer_profiles SET jobs_completed = jobs_completed + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      user_id
    );
  },

  async updateRating(user_id: number): Promise<void> {
    // Recalculate rating from reviews where the freelancer is the reviewee
    await db.connection?.run(
      `UPDATE freelancer_profiles 
       SET rating = (
         SELECT COALESCE(AVG(r.rating), 0) 
         FROM reviews r 
         WHERE r.reviewee_id = freelancer_profiles.user_id
       ),
       reviews_count = (
         SELECT COUNT(*) 
         FROM reviews r 
         WHERE r.reviewee_id = freelancer_profiles.user_id
       ),
       updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      user_id
    );
  },

  async getAll(options?: { 
    skill?: string; 
    experience_level?: ExperienceLevel;
    limit?: number; 
    offset?: number;
  }): Promise<{ freelancers: FreelancerProfileFull[]; total: number }> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    let whereConditions: string[] = ['u.status = \'active\''];
    const params: (string | number)[] = [];

    if (options?.skill) {
      whereConditions.push(`s.name LIKE ?`);
      params.push(`%${options.skill}%`);
    }

    if (options?.experience_level) {
      whereConditions.push(`fp.experience_level = ?`);
      params.push(options.experience_level);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total
    const countQuery = `
      SELECT COUNT(DISTINCT fp.id) as total
      FROM freelancer_profiles fp
      INNER JOIN users u ON fp.user_id = u.user_id
      LEFT JOIN profile_skills ps ON fp.user_id = ps.user_id
      LEFT JOIN skills s ON ps.skill_id = s.skill_id
      ${whereClause}
    `;
    const countResult = await db.connection?.get<{ total: number }>(countQuery, ...params);
    const total = countResult?.total ?? 0;

    // Get freelancers
    const query = `
      SELECT 
        fp.*,
        u.first_name,
        u.last_name,
        u.email,
        p.display_name,
        p.headline,
        p.description,
        p.photo_url,
        p.location,
        GROUP_CONCAT(DISTINCT s.name) as skill_names
      FROM freelancer_profiles fp
      INNER JOIN users u ON fp.user_id = u.user_id
      LEFT JOIN profiles p ON fp.user_id = p.user_id
      LEFT JOIN profile_skills ps ON fp.user_id = ps.user_id
      LEFT JOIN skills s ON ps.skill_id = s.skill_id
      ${whereClause}
      GROUP BY fp.id
      ORDER BY fp.rating DESC, fp.jobs_completed DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await db.connection?.all<FreelancerProfileRow[]>(query, ...params, limit, offset);

    const freelancers: FreelancerProfileFull[] = (rows || []).map(row => ({
      ...row,
      experience_level: row.experience_level as ExperienceLevel | null,
      first_name: row.first_name!,
      last_name: row.last_name!,
      email: row.email!,
      skills: row.skill_names ? row.skill_names.split(',') : []
    }));

    return { freelancers, total };
  }
};
