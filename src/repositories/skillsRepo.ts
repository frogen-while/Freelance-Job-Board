import { db } from '../config/init_db.js';
import { Skill } from '../interfaces/Skill.js';

export const skillsRepo = {
  async get_all(): Promise<Skill[]> {
    const result = await db.connection?.all<Skill[]>(
      'SELECT skill_id, name FROM skills ORDER BY name ASC'
    );
    return result || [];
  },

  async findById(skill_id: number): Promise<Skill | undefined> {
    return await db.connection?.get<Skill | undefined>(
      'SELECT skill_id, name FROM skills WHERE skill_id = ?',
      skill_id
    );
  },

  async findByName(name: string): Promise<Skill | undefined> {
    return await db.connection?.get<Skill | undefined>(
      'SELECT skill_id, name FROM skills WHERE name = ?',
      name
    );
  },

  async create(name: string): Promise<number | null> {
    const result = await db.connection?.run(
      'INSERT INTO skills (name) VALUES (?)',
      name
    );
    return result?.lastID ?? null;
  },

  async deleteById(skill_id: number): Promise<void> {
    await db.connection?.run('DELETE FROM skills WHERE skill_id = ?', skill_id);
  }
};
