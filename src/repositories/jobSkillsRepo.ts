import { db } from '../config/init_db.js';

export interface JobSkill {
  job_id: number;
  skill_id: number;
  skill_name?: string;
}

export const jobSkillsRepo = {
  async getByJobId(job_id: number): Promise<JobSkill[]> {
    const rows = await db.connection?.all<(JobSkill & { name: string })[]>(
      `SELECT js.job_id, js.skill_id, s.name as skill_name
       FROM job_skills js
       INNER JOIN skills s ON js.skill_id = s.skill_id
       WHERE js.job_id = ?`,
      job_id
    );
    return rows || [];
  },

  async getSkillNamesByJobId(job_id: number): Promise<string[]> {
    const rows = await db.connection?.all<{ name: string }[]>(
      `SELECT s.name
       FROM job_skills js
       INNER JOIN skills s ON js.skill_id = s.skill_id
       WHERE js.job_id = ?`,
      job_id
    );
    return (rows || []).map(r => r.name);
  },

  async setJobSkills(job_id: number, skill_ids: number[]): Promise<void> {

    await db.connection?.run(
      `DELETE FROM job_skills WHERE job_id = ?`,
      job_id
    );

    for (const skill_id of skill_ids) {
      await db.connection?.run(
        `INSERT INTO job_skills (job_id, skill_id) VALUES (?, ?)`,
        job_id,
        skill_id
      );
    }
  },

  async addSkillToJob(job_id: number, skill_id: number): Promise<void> {
    await db.connection?.run(
      `INSERT OR IGNORE INTO job_skills (job_id, skill_id) VALUES (?, ?)`,
      job_id,
      skill_id
    );
  },

  async removeSkillFromJob(job_id: number, skill_id: number): Promise<void> {
    await db.connection?.run(
      `DELETE FROM job_skills WHERE job_id = ? AND skill_id = ?`,
      job_id,
      skill_id
    );
  },

  async getJobsBySkillId(skill_id: number): Promise<number[]> {
    const rows = await db.connection?.all<{ job_id: number }[]>(
      `SELECT job_id FROM job_skills WHERE skill_id = ?`,
      skill_id
    );
    return (rows || []).map(r => r.job_id);
  }
};
