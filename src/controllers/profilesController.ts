import type { Request, Response } from 'express';
import { sendError, sendSuccess } from '../utils/http.js';
import { profilesRepo } from '../repositories/profilesRepo.js';
import { profileSkillsRepo } from '../repositories/profileSkillsRepo.js';

export const getProfileByUserId = async (req: Request, res: Response) => {
  const userId = Number.parseInt(req.params.userId, 10);
  if (Number.isNaN(userId)) {
    return sendError(res, 400, 'Invalid user ID format.');
  }

  try {
    const profile = await profilesRepo.findByUserId(userId);
    if (!profile) {
      return sendError(res, 404, 'Profile not found.');
    }

    return sendSuccess(res, profile);
  } catch (error) {
    console.error('Error fetching profile', error);
    return sendError(res, 500, 'An internal server error occurred while fetching profile.');
  }
};

export const upsertProfile = async (req: Request, res: Response) => {
  const userId = Number.parseInt(req.params.userId, 10);
  if (Number.isNaN(userId)) {
    return sendError(res, 400, 'Invalid user ID format.');
  }

  const {
    description = null,
    photo_url = null,
    education_info = null,
    languages = null,
    completed_orders = null,
    timezone = null,
    hourly_rate = null
  } = req.body as {
    description?: unknown;
    photo_url?: unknown;
    education_info?: unknown;
    languages?: unknown;
    completed_orders?: unknown;
    timezone?: unknown;
    hourly_rate?: unknown;
  };

  const payload = {
    description: typeof description === 'string' ? description : null,
    photo_url: typeof photo_url === 'string' ? photo_url : null,
    education_info: typeof education_info === 'string' ? education_info : null,
    languages: typeof languages === 'string' ? languages : null,
    completed_orders: typeof completed_orders === 'string' ? completed_orders : null,
    timezone: typeof timezone === 'string' ? timezone : null,
    hourly_rate: typeof hourly_rate === 'number' ? hourly_rate : null
  };

  try {
    await profilesRepo.upsert(userId, payload);
    const profile = await profilesRepo.findByUserId(userId);
    return sendSuccess(res, profile ?? { user_id: userId, ...payload }, 200);
  } catch (error) {
    console.error('Error upserting profile', error);
    return sendError(res, 500, 'An internal server error occurred while updating profile.');
  }
};

export const getProfileSkills = async (req: Request, res: Response) => {
  const userId = Number.parseInt(req.params.userId, 10);
  if (Number.isNaN(userId)) {
    return sendError(res, 400, 'Invalid user ID format.');
  }

  try {
    const skills = await profileSkillsRepo.listSkillsForUser(userId);
    return sendSuccess(res, skills);
  } catch (error) {
    console.error('Error fetching profile skills', error);
    return sendError(res, 500, 'An internal server error occurred while fetching profile skills.');
  }
};

export const setProfileSkills = async (req: Request, res: Response) => {
  const userId = Number.parseInt(req.params.userId, 10);
  if (Number.isNaN(userId)) {
    return sendError(res, 400, 'Invalid user ID format.');
  }

  const { skill_ids } = req.body as { skill_ids?: unknown };
  if (!Array.isArray(skill_ids) || !skill_ids.every((x) => Number.isInteger(x))) {
    return sendError(res, 400, 'skill_ids must be an array of integers.');
  }

  try {
    await profileSkillsRepo.setSkillsForUser(userId, skill_ids as number[]);
    const skills = await profileSkillsRepo.listSkillsForUser(userId);
    return sendSuccess(res, skills, 200);
  } catch (error) {
    console.error('Error setting profile skills', error);
    return sendError(res, 500, 'An internal server error occurred while setting profile skills.');
  }
};
