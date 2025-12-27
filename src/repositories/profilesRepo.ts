import { db } from '../config/init_db.js';
import { Profile } from '../interfaces/Profile.js';

type ProfileRow = Omit<Profile, 'skills'> & { skills: string | null };

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
      `SELECT profile_id, user_id, description, photo_url, education_info, languages, completed_orders, timezone, hourly_rate, skills
       FROM profiles
       WHERE user_id = ?`,
      user_id
    );

    if (!row) return undefined;
    return { ...row, skills: parseSkills(row.skills) };
  },

  async upsert(user_id: number, data: Omit<Profile, 'user_id' | 'profile_id'>): Promise<void> {
    const skillsJson = data.skills ? JSON.stringify(data.skills) : null;

    await db.connection?.run(
      `INSERT INTO profiles (user_id, description, photo_url, education_info, languages, completed_orders, timezone, hourly_rate, skills)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         description = excluded.description,
         photo_url = excluded.photo_url,
         education_info = excluded.education_info,
         languages = excluded.languages,
         completed_orders = excluded.completed_orders,
         timezone = excluded.timezone,
         hourly_rate = excluded.hourly_rate,
         skills = excluded.skills`,
      user_id,
      data.description,
      data.photo_url,
      data.education_info,
      data.languages,
      data.completed_orders,
      data.timezone,
      data.hourly_rate,
      skillsJson
    );
  }
};
