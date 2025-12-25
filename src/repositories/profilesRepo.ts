import { db } from '../config/init_db.js';
import { Profile } from '../interfaces/Profile.js';

export const profilesRepo = {
  async findByUserId(user_id: number): Promise<Profile | undefined> {
    return await db.connection?.get<Profile | undefined>(
      `SELECT user_id, description, photo_url, education_info, languages, completed_orders, timezone, hourly_rate
       FROM profiles
       WHERE user_id = ?`,
      user_id
    );
  },

  async upsert(user_id: number, data: Omit<Profile, 'user_id'>): Promise<void> {
    await db.connection?.run(
      `INSERT INTO profiles (user_id, description, photo_url, education_info, languages, completed_orders, timezone, hourly_rate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         description = excluded.description,
         photo_url = excluded.photo_url,
         education_info = excluded.education_info,
         languages = excluded.languages,
         completed_orders = excluded.completed_orders,
         timezone = excluded.timezone,
         hourly_rate = excluded.hourly_rate`,
      user_id,
      data.description,
      data.photo_url,
      data.education_info,
      data.languages,
      data.completed_orders,
      data.timezone,
      data.hourly_rate
    );
  }
};
