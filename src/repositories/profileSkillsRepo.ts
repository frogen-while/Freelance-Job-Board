import { db } from '../config/init_db.js';
import { Skill } from '../interfaces/Skill.js';

export const profileSkillsRepo = {
  async listSkillsForUser(user_id: number): Promise<Skill[]> {
    const result = await db.connection?.all<Skill[]>(
      `SELECT s.skill_id, s.name
       FROM profile_skills ps
       JOIN skills s ON s.skill_id = ps.skill_id
       WHERE ps.user_id = ?
       ORDER BY s.name ASC`,
      user_id
    );
    return result || [];
  },

  async setSkillsForUser(user_id: number, skill_ids: number[]): Promise<void> {
    if (!db.connection) return;

    await db.connection.exec('BEGIN;');
    try {
      await db.connection.run('DELETE FROM profile_skills WHERE user_id = ?', user_id);

      for (const skill_id of skill_ids) {
        await db.connection.run(
          'INSERT INTO profile_skills (user_id, skill_id) VALUES (?, ?)',
          user_id,
          skill_id
        );
      }

      await db.connection.exec('COMMIT;');
    } catch (e) {
      await db.connection.exec('ROLLBACK;');
      throw e;
    }
  }
};
