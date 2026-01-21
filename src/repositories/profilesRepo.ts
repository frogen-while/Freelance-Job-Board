import { db } from '../config/init_db.js';
import { Profile } from '../interfaces/Profile.js';

type ProfileRow = Omit<Profile, 'skills'> & { skills: string | null };

interface FreelancerProfileRow {
  profile_id: number;
  user_id: number;
  display_name: string | null;
  headline: string | null;
  description: string | null;
  photo_url: string | null;
  location: string | null;
  hourly_rate: number | null;
  jobs_completed: number | null;
  first_name: string;
  last_name: string;
  skill_names: string | null;
}

export interface FreelancerProfile {
  profile_id: number;
  user_id: number;
  display_name: string | null;
  headline: string | null;
  description: string | null;
  photo_url: string | null;
  location: string | null;
  hourly_rate: number | null;
  jobs_completed: number | null;
  first_name: string;
  last_name: string;
  skills: string[];
}

function parseSkills(skills: string | null): number[] | null {
  if (!skills) return null;
  try {
    const parsed = JSON.parse(skills) as unknown;
    if (Array.isArray(parsed) && parsed.every((x) => Number.isInteger(x))) return parsed as number[];
    return null;
  } catch {
    return null;
  }
}

export const profilesRepo = {
  async findByUserId(user_id: number): Promise<Profile | undefined> {
    const row = await db.connection?.get<ProfileRow | undefined>(
      `SELECT profile_id, user_id, display_name, headline, description, photo_url, location, onboarding_completed
       FROM profiles
       WHERE user_id = ?`,
      user_id
    );

    if (!row) return undefined;
    return { ...row, skills: parseSkills(row.skills) };
  },

  async upsert(user_id: number, data: {
    display_name?: string | null;
    headline?: string | null;
    description?: string | null;
    photo_url?: string | null;
    location?: string | null;
    onboarding_completed?: boolean | null;
    skills?: number[] | null;
  }): Promise<void> {
    await db.connection?.run(
      `INSERT INTO profiles (user_id, display_name, headline, description, photo_url, location, onboarding_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         display_name = COALESCE(excluded.display_name, profiles.display_name),
         headline = COALESCE(excluded.headline, profiles.headline),
         description = COALESCE(excluded.description, profiles.description),
         photo_url = COALESCE(excluded.photo_url, profiles.photo_url),
         location = COALESCE(excluded.location, profiles.location),
         onboarding_completed = COALESCE(excluded.onboarding_completed, profiles.onboarding_completed),
         updated_at = CURRENT_TIMESTAMP`,
      user_id,
      data.display_name,
      data.headline,
      data.description,
      data.photo_url,
      data.location,
      data.onboarding_completed ? 1 : 0
    );
  },

  async getFreelancers(options?: {
    category?: string;
    skill?: string;
    limit?: number;
    offset?: number;
  }): Promise<FreelancerProfile[]> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    let query = `
      SELECT
        p.profile_id,
        p.user_id,
        p.display_name,
        p.headline,
        p.description,
        p.photo_url,
        p.location,
        fp.hourly_rate,
        fp.jobs_completed,
        u.first_name,
        u.last_name,
        GROUP_CONCAT(s.name) as skill_names
      FROM profiles p
      INNER JOIN users u ON p.user_id = u.user_id AND u.main_role = 'Freelancer'
      LEFT JOIN freelancer_profiles fp ON p.user_id = fp.user_id
      LEFT JOIN profile_skills ps ON p.user_id = ps.user_id
      LEFT JOIN skills s ON ps.skill_id = s.skill_id
      WHERE u.is_blocked = 0
    `;

    const params: (string | number)[] = [];

    if (options?.skill) {
      query += ` AND s.name LIKE ?`;
      params.push(`%${options.skill}%`);
    }

    query += ` GROUP BY p.profile_id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = await db.connection?.all<FreelancerProfileRow[]>(query, ...params);

    if (!rows) return [];

    return rows.map(row => ({
      profile_id: row.profile_id,
      user_id: row.user_id,
      display_name: row.display_name,
      headline: row.headline,
      description: row.description,
      photo_url: row.photo_url,
      location: row.location,
      hourly_rate: row.hourly_rate,
      jobs_completed: row.jobs_completed,
      first_name: row.first_name,
      last_name: row.last_name,
      skills: row.skill_names ? row.skill_names.split(',') : []
    }));
  },

  async getFeaturedFreelancers(limit: number = 6): Promise<FreelancerProfile[]> {
    const query = `
      SELECT
        p.profile_id,
        p.user_id,
        p.display_name,
        p.headline,
        p.description,
        p.photo_url,
        p.location,
        fp.hourly_rate,
        fp.jobs_completed,
        u.first_name,
        u.last_name,
        GROUP_CONCAT(s.name) as skill_names
      FROM profiles p
      INNER JOIN users u ON p.user_id = u.user_id AND u.main_role = 'Freelancer'
      LEFT JOIN freelancer_profiles fp ON p.user_id = fp.user_id
      LEFT JOIN profile_skills ps ON p.user_id = ps.user_id
      LEFT JOIN skills s ON ps.skill_id = s.skill_id
      WHERE u.is_blocked = 0
      GROUP BY p.profile_id
      ORDER BY RANDOM()
      LIMIT ?
    `;

    const rows = await db.connection?.all<FreelancerProfileRow[]>(query, limit);

    if (!rows) return [];

    return rows.map(row => ({
      profile_id: row.profile_id,
      user_id: row.user_id,
      display_name: row.display_name,
      headline: row.headline,
      description: row.description,
      photo_url: row.photo_url,
      location: row.location,
      hourly_rate: row.hourly_rate,
      jobs_completed: row.jobs_completed,
      first_name: row.first_name,
      last_name: row.last_name,
      skills: row.skill_names ? row.skill_names.split(',') : []
    }));
  },

  async countFreelancers(): Promise<number> {
    const result = await db.connection?.get<{ count: number }>(
      `SELECT COUNT(DISTINCT p.profile_id) as count
       FROM profiles p
       INNER JOIN users u ON p.user_id = u.user_id AND u.main_role = 'Freelancer'
      WHERE u.is_blocked = 0`
    );
    return result?.count ?? 0;
  }
};