import type { Request, Response } from 'express';
import { parseIdParam, rethrowHttpError, sendError, sendSuccess } from '../utils/http.js';
import { profilesRepo } from '../repositories/profilesRepo.js';
import { profileSkillsRepo } from '../repositories/profileSkillsRepo.js';
import { freelancerProfilesRepo } from '../repositories/freelancerProfilesRepo.js';
import { employerProfilesRepo } from '../repositories/employerProfilesRepo.js';

export const getProfileByUserId = async (req: Request, res: Response) => {
  const userId = parseIdParam(res, req.params.userId, 'user');
  if (userId === null) return;

  try {
    const profile = await profilesRepo.findByUserId(userId);
    if (!profile) {
      return sendError(res, 404, 'Profile not found.');
    }

    return sendSuccess(res, profile);
  } catch (error) {
    console.error('Error fetching profile', error);
    rethrowHttpError(error, 500, 'An internal server error occurred while fetching profile.');
  }
};

export const upsertProfile = async (req: Request, res: Response) => {
  const userId = parseIdParam(res, req.params.userId, 'user');
  if (userId === null) return;

  const {
    display_name = null,
    headline = null,
    description = null,
    photo_url = null,
    location = null,
    onboarding_completed = null,
    skills = undefined
  } = req.body as {
    display_name?: unknown;
    headline?: unknown;
    description?: unknown;
    photo_url?: unknown;
    location?: unknown;
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
    rethrowHttpError(error, 500, 'An internal server error occurred while updating profile.');
  }
};

export const getProfileSkills = async (req: Request, res: Response) => {
  const userId = parseIdParam(res, req.params.userId, 'user');
  if (userId === null) return;

  try {
    const skills = await profileSkillsRepo.listSkillsForUser(userId);
    return sendSuccess(res, skills);
  } catch (error) {
    console.error('Error fetching profile skills', error);
    rethrowHttpError(error, 500, 'An internal server error occurred while fetching profile skills.');
  }
};

export const setProfileSkills = async (req: Request, res: Response) => {
  const userId = parseIdParam(res, req.params.userId, 'user');
  if (userId === null) return;

  const { skill_ids } = req.body as { skill_ids?: unknown };
  if (!Array.isArray(skill_ids) || !skill_ids.every((x) => Number.isInteger(x))) {
    return sendError(res, 400, 'skill_ids must be an array of integers.');
  }

  try {
    await profileSkillsRepo.setSkillsForUser(userId, skill_ids as number[]);
    await profilesRepo.upsert(userId, {
      skills: skill_ids as number[]
    });

    const profile = await profilesRepo.findByUserId(userId);
    return sendSuccess(res, profile?.skills ?? (skill_ids as number[]), 200);
  } catch (error) {
    console.error('Error setting profile skills', error);
    rethrowHttpError(error, 500, 'An internal server error occurred while setting profile skills.');
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
    rethrowHttpError(error, 500, 'An internal server error occurred while fetching freelancers.');
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
    rethrowHttpError(error, 500, 'An internal server error occurred while fetching featured freelancers.');
  }
};

export const getFreelancerProfile = async (req: Request, res: Response) => {
  const userId = parseIdParam(res, req.params.userId, 'user');
  if (userId === null) return;

  try {
    const profile = await freelancerProfilesRepo.findFullByUserId(userId);
    if (!profile) {
      return sendError(res, 404, 'Freelancer profile not found.');
    }

    return sendSuccess(res, profile);
  } catch (error) {
    console.error('Error fetching freelancer profile', error);
    rethrowHttpError(error, 500, 'An internal server error occurred while fetching freelancer profile.');
  }
};

export const upsertFreelancerProfile = async (req: Request, res: Response) => {
  const userId = parseIdParam(res, req.params.userId, 'user');
  if (userId === null) return;

  const {
    title,
    hourly_rate,
    availability_status,
    experience_level,
    github_url,
    linkedin_url
  } = req.body as {
    title?: string;
    hourly_rate?: number;
    availability_status?: string;
    experience_level?: string;
    github_url?: string;
    linkedin_url?: string;
  };

  try {
    await freelancerProfilesRepo.upsert(userId, {
      title: title ?? null,
      hourly_rate: hourly_rate ?? null,
      availability_status: availability_status as 'available' | 'partially_available' | 'not_available' ?? null,
      experience_level: experience_level as 'entry' | 'intermediate' | 'expert' ?? null,
      github_url: github_url ?? null,
      linkedin_url: linkedin_url ?? null
    });

    const profile = await freelancerProfilesRepo.findByUserId(userId);
    return sendSuccess(res, profile, 200);
  } catch (error) {
    console.error('Error upserting freelancer profile', error);
    rethrowHttpError(error, 500, 'An internal server error occurred while updating freelancer profile.');
  }
};

export const getEmployerProfile = async (req: Request, res: Response) => {
  const userId = parseIdParam(res, req.params.userId, 'user');
  if (userId === null) return;

  try {
    const profile = await employerProfilesRepo.findFullByUserId(userId);
    if (!profile) {
      return sendError(res, 404, 'Employer profile not found.');
    }

    return sendSuccess(res, profile);
  } catch (error) {
    console.error('Error fetching employer profile', error);
    rethrowHttpError(error, 500, 'An internal server error occurred while fetching employer profile.');
  }
};

export const upsertEmployerProfile = async (req: Request, res: Response) => {
  const userId = parseIdParam(res, req.params.userId, 'user');
  if (userId === null) return;

  const {
    company_name,
    company_description,
    company_website,
    company_size,
    industry
  } = req.body as {
    company_name?: string;
    company_description?: string;
    company_website?: string;
    company_size?: string;
    industry?: string;
  };

  try {
    await employerProfilesRepo.upsert(userId, {
      company_name: company_name ?? null,
      company_description: company_description ?? null,
      company_website: company_website ?? null,
      company_size: company_size as '1-10' | '11-50' | '51-200' | '201-500' | '500+' ?? null,
      industry: industry ?? null
    });

    const profile = await employerProfilesRepo.findByUserId(userId);
    return sendSuccess(res, profile, 200);
  } catch (error) {
    console.error('Error upserting employer profile', error);
    rethrowHttpError(error, 500, 'An internal server error occurred while updating employer profile.');
  }
};

export const getEmployers = async (req: Request, res: Response) => {
  const { limit, offset } = req.query;

  try {
    const employers = await employerProfilesRepo.getAll({
      limit: limit ? Number.parseInt(limit as string, 10) : 20,
      offset: offset ? Number.parseInt(offset as string, 10) : 0
    });

    return sendSuccess(res, employers);
  } catch (error) {
    console.error('Error fetching employers', error);
    rethrowHttpError(error, 500, 'An internal server error occurred while fetching employers.');
  }
};