import { Request, Response } from 'express';
import { statsRepo } from '../repositories/statsRepo.js';
import { sendError, sendSuccess } from '../utils/http.js';

export const getOverviewStats = async (req: Request, res: Response) => {
  try {
    const stats = await statsRepo.getOverviewStats();
    return sendSuccess(res, stats);
  } catch (error) {
    console.error('Error getting overview stats:', error);
    return sendError(res, 500, 'Failed to get overview statistics.');
  }
};

export const getRevenueStats = async (req: Request, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    const validPeriods = ['week', 'month', 'year', 'all'];
    
    if (!validPeriods.includes(period as string)) {
      return sendError(res, 400, `Invalid period. Valid periods: ${validPeriods.join(', ')}`);
    }

    const stats = await statsRepo.getRevenueStats(period as 'week' | 'month' | 'year' | 'all');
    return sendSuccess(res, stats);
  } catch (error) {
    console.error('Error getting revenue stats:', error);
    return sendError(res, 500, 'Failed to get revenue statistics.');
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    const validPeriods = ['week', 'month', 'year'];
    
    if (!validPeriods.includes(period as string)) {
      return sendError(res, 400, `Invalid period. Valid periods: ${validPeriods.join(', ')}`);
    }

    const stats = await statsRepo.getUserStats(period as 'week' | 'month' | 'year');
    return sendSuccess(res, stats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    return sendError(res, 500, 'Failed to get user statistics.');
  }
};

export const getJobStats = async (req: Request, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    const validPeriods = ['week', 'month', 'year'];
    
    if (!validPeriods.includes(period as string)) {
      return sendError(res, 400, `Invalid period. Valid periods: ${validPeriods.join(', ')}`);
    }

    const stats = await statsRepo.getJobStats(period as 'week' | 'month' | 'year');
    return sendSuccess(res, stats);
  } catch (error) {
    console.error('Error getting job stats:', error);
    return sendError(res, 500, 'Failed to get job statistics.');
  }
};
