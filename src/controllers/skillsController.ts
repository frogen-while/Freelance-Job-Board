import type { Request, Response } from 'express';
import { sendError, sendSuccess } from '../utils/http.js';
import { skillsRepo } from '../repositories/skillsRepo.js';

export const getAllSkills = async (req: Request, res: Response) => {
  try {
    const data = await skillsRepo.get_all();
    return sendSuccess(res, data);
  } catch (error) {
    console.error('Error fetching skills', error);
    return sendError(res, 500, 'An internal server error occurred while fetching skills.');
  }
};

export const createSkill = async (req: Request, res: Response) => {
  const { name } = req.body as { name?: unknown };

  if (typeof name !== 'string' || name.trim().length === 0) {
    return sendError(res, 400, 'Skill name is required.');
  }

  try {
    const existing = await skillsRepo.findByName(name.trim());
    if (existing) {
      return sendSuccess(res, existing, 200);
    }

    const id = await skillsRepo.create(name.trim());
    if (!id) {
      return sendError(res, 500, 'Failed to create skill.');
    }

    const created = await skillsRepo.findById(id);
    if (!created) {
      return sendError(res, 500, 'Failed to load created skill.');
    }

    return sendSuccess(res, created, 201);
  } catch (error) {
    console.error('Error creating skill', error);
    return sendError(res, 500, 'An internal server error occurred while creating a skill.');
  }
};

export const deleteSkill = async (req: Request, res: Response) => {
  const skillId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(skillId)) {
    return sendError(res, 400, 'Invalid skill ID format.');
  }

  try {
    await skillsRepo.deleteById(skillId);
    return res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting skill', error);
    return sendError(res, 500, 'An internal server error occurred while deleting a skill.');
  }
};
