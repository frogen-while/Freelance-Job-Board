import { Request, Response } from 'express';
import { statsRepo } from '../repositories/statsRepo.js';
import { rethrowHttpError, sendError, sendSuccess } from '../utils/http.js';
import { db } from '../config/init_db.js';

export const getOverviewStats = async (req: Request, res: Response) => {
  try {
    const stats = await statsRepo.getOverviewStats();

    return sendSuccess(res, {
      total_users: stats.users.total,
      total_jobs: stats.jobs.total,
      total_applications: stats.applications.total,
      open_tickets: stats.tickets.open,
      new_users_this_week: stats.users.newThisWeek,
      new_users_this_month: stats.users.newThisMonth,
      active_jobs: stats.jobs.byStatus['Open'] || 0,
      completed_jobs: stats.jobs.byStatus['Completed'] || 0
    });
  } catch (error) {
    console.error('Error getting overview stats:', error);
    rethrowHttpError(error, 500, 'Failed to get overview statistics.');
  }
};

export const getRevenueStats = async (req: Request, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    const validPeriods = ['week', 'month', 'year', 'all'];

    if (!validPeriods.includes(period as string)) {
      return sendError(res, 400, `Invalid period. Valid periods: ${validPeriods.join(', ')}`);
    }

    const topCategories = await db.connection?.all<{ category_id: number; category_name: string; total: number }[]>(`
      SELECT c.category_id, c.name as category_name, COALESCE(SUM(j.budget), 0) as total
      FROM categories c
      LEFT JOIN jobs j ON c.category_id = j.category_id
      GROUP BY c.category_id
      HAVING total > 0
      ORDER BY total DESC
      LIMIT 5
    `) || [];

    const budgetStats = await db.connection?.get<{ total: number; this_month: number; avg: number }>(`
      SELECT
        COALESCE(SUM(budget), 0) as total,
        COALESCE(SUM(CASE WHEN created_at >= datetime('now', '-30 days') THEN budget ELSE 0 END), 0) as this_month,
        COALESCE(AVG(budget), 0) as avg
      FROM jobs
    `);

    return sendSuccess(res, {
      total_revenue: budgetStats?.total || 0,
      revenue_this_month: budgetStats?.this_month || 0,
      revenue_this_week: 0,
      average_job_value: budgetStats?.avg || 0,
      top_categories: topCategories
    });
  } catch (error) {
    console.error('Error getting revenue stats:', error);
    rethrowHttpError(error, 500, 'Failed to get revenue statistics.');
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    const validPeriods = ['week', 'month', 'year'];

    if (!validPeriods.includes(period as string)) {
      return sendError(res, 400, `Invalid period. Valid periods: ${validPeriods.join(', ')}`);
    }

    const [blocked, totalEmployers, totalFreelancers, activeEmployers, activeFreelancers] = await Promise.all([
      db.connection?.get<{ count: number }>('SELECT COUNT(*) as count FROM users WHERE is_blocked = 1'),
      db.connection?.get<{ count: number }>('SELECT COUNT(DISTINCT employer_id) as count FROM jobs'),
      db.connection?.get<{ count: number }>('SELECT COUNT(DISTINCT freelancer_id) as count FROM jobapplications'),

      db.connection?.get<{ count: number }>("SELECT COUNT(DISTINCT employer_id) as count FROM jobs WHERE created_at >= datetime('now', '-30 days')"),
      db.connection?.get<{ count: number }>("SELECT COUNT(DISTINCT freelancer_id) as count FROM jobapplications WHERE created_at >= datetime('now', '-30 days')")
    ]);

    return sendSuccess(res, {
      total_employers: totalEmployers?.count || 0,
      total_freelancers: totalFreelancers?.count || 0,
      new_employers_this_month: activeEmployers?.count || 0,
      new_freelancers_this_month: activeFreelancers?.count || 0,
      active_employers: activeEmployers?.count || 0,
      active_freelancers: activeFreelancers?.count || 0,
      blocked_users: blocked?.count || 0
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    rethrowHttpError(error, 500, 'Failed to get user statistics.');
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

    return sendSuccess(res, {
      total_jobs: stats.totalJobs,
      open_jobs: stats.jobsByStatus['Open'] || 0,
      assigned_jobs: stats.jobsByStatus['In Progress'] || 0,
      completed_jobs: stats.jobsByStatus['Completed'] || 0,
      cancelled_jobs: stats.jobsByStatus['Cancelled'] || 0,
      jobs_this_month: stats.totalJobs,
      average_budget: Math.round(stats.averageBudget)
    });
  } catch (error) {
    console.error('Error getting job stats:', error);
    rethrowHttpError(error, 500, 'Failed to get job statistics.');
  }
};
