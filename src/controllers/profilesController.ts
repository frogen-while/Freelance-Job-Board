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
    display_name = null,
    headline = null,
    description = null,
    photo_url = null,
    location = null,
    hourly_rate = null,
    availability_status = null,
    onboarding_completed = null,
    skills = undefined
  } = req.body as {
    display_name?: unknown;
    headline?: unknown;
    description?: unknown;
    photo_url?: unknown;
    location?: unknown;
    hourly_rate?: unknown;
    availability_status?: unknown;
    onboarding_completed?: unknown;
    skills?: unknown;
  };

  if (skills !== undefined && (!Array.isArray(skills) || !skills.every((x) => Number.isInteger(x)))) {
    return sendError(res, 400, 'skills must be an array of integers (skill_id).');
  }

  const payload = {
    display_name: typeof display_name === 'string' ? display_name : null,
    headline: typeof headline === 'string' ? headline : null,
    description: typeof description === 'string' ? description : null,
    photo_url: typeof photo_url === 'string' ? photo_url : null,
    location: typeof location === 'string' ? location : null,
    hourly_rate: typeof hourly_rate === 'number' ? hourly_rate : null,
    availability_status: typeof availability_status === 'string' ? availability_status : null,
    onboarding_completed: typeof onboarding_completed === 'boolean' ? onboarding_completed : null,
    skills: skills === undefined ? null : (skills as number[])
  };

  try {
    await profilesRepo.upsert(userId, payload);

    if (skills !== undefined) {
      await profileSkillsRepo.setSkillsForUser(userId, skills as number[]);
    }

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
    await profilesRepo.upsert(userId, {
      description: null,
      photo_url: null,
      education_info: null,
      languages: null,
      timezone: null,
      hourly_rate_min: null,
      hourly_rate_max: null,
      skills: skill_ids as number[]
    });

    const profile = await profilesRepo.findByUserId(userId);
    return sendSuccess(res, profile?.skills ?? (skill_ids as number[]), 200);
  } catch (error) {
    console.error('Error setting profile skills', error);
    return sendError(res, 500, 'An internal server error occurred while setting profile skills.');
  }
};

export const getFreelancers = async (req: Request, res: Response) => {
  const { skill, limit, offset } = req.query;

  try {
    const freelancers = await profilesRepo.getFreelancers({
      skill: typeof skill === 'string' ? skill : undefined,
      limit: limit ? Number.parseInt(limit as string, 10) : 20,
      offset: offset ? Number.parseInt(offset as string, 10) : 0
    });
    const total = await profilesRepo.countFreelancers();

    return sendSuccess(res, { freelancers, total });
  } catch (error) {
    console.error('Error fetching freelancers', error);
    return sendError(res, 500, 'An internal server error occurred while fetching freelancers.');
  }
};

export const getFeaturedFreelancers = async (req: Request, res: Response) => {
  const { limit } = req.query;

  try {
    const freelancers = await profilesRepo.getFeaturedFreelancers(
      limit ? Number.parseInt(limit as string, 10) : 6
    );

    return sendSuccess(res, freelancers);
  } catch (error) {
    console.error('Error fetching featured freelancers', error);
    return sendError(res, 500, 'An internal server error occurred while fetching featured freelancers.');
  }
};