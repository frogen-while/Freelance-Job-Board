import { db } from '../config/init_db.js';

export interface OverviewStats {
  users: {
    total: number;
    byRole: Record<string, number>;
    blocked: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  jobs: {
    total: number;
    byStatus: Record<string, number>;
    newThisWeek: number;
    newThisMonth: number;
    hidden: number;
  };
  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    escalated: number;
    resolved: number;
  };
}

export interface RevenueStats {
  totalRevenue: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedAmount: number;
  averagePaymentAmount: number;
  revenueByPeriod: Array<{ period: string; amount: number; count: number }>;
}

export interface UserStats {
  totalUsers: number;
  growthByPeriod: Array<{ period: string; count: number }>;
  roleDistribution: Record<string, number>;
  topEmployers: Array<{ user_id: number; name: string; jobsPosted: number }>;
  topFreelancers: Array<{ user_id: number; name: string; jobsCompleted: number; rating: number }>;
}

export interface JobStats {
  totalJobs: number;
  jobsByStatus: Record<string, number>;
  jobsByCategory: Array<{ category_id: number; name: string; count: number }>;
  averageBudget: number;
  jobsByExperienceLevel: Record<string, number>;
  jobsByType: { fixed: number; hourly: number };
  completionRate: number;
}

export const statsRepo = {
  async getOverviewStats(): Promise<OverviewStats> {
    const [
      totalUsers,
      usersByRole,
      blockedUsers,
      usersThisWeek,
      usersThisMonth,
      totalJobs,
      jobsByStatus,
      jobsThisWeek,
      jobsThisMonth,
      hiddenJobs,
      totalApplications,
      applicationsByStatus,
      totalTickets,
      ticketsByStatus
    ] = await Promise.all([
      db.connection?.get<{ count: number }>('SELECT COUNT(*) as count FROM users'),
      db.connection?.all<{ main_role: string; count: number }[]>('SELECT main_role, COUNT(*) as count FROM users GROUP BY main_role'),
      db.connection?.get<{ count: number }>('SELECT COUNT(*) as count FROM users WHERE is_blocked = 1'),
      db.connection?.get<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-7 days')"),
      db.connection?.get<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-30 days')"),
      db.connection?.get<{ count: number }>('SELECT COUNT(*) as count FROM jobs'),
      db.connection?.all<{ status: string; count: number }[]>('SELECT status, COUNT(*) as count FROM jobs GROUP BY status'),
      db.connection?.get<{ count: number }>("SELECT COUNT(*) as count FROM jobs WHERE created_at >= datetime('now', '-7 days')"),
      db.connection?.get<{ count: number }>("SELECT COUNT(*) as count FROM jobs WHERE created_at >= datetime('now', '-30 days')"),
      db.connection?.get<{ count: number }>('SELECT COUNT(*) as count FROM jobs WHERE is_hidden = 1'),
      db.connection?.get<{ count: number }>('SELECT COUNT(*) as count FROM jobapplications'),
      db.connection?.all<{ status: string; count: number }[]>('SELECT status, COUNT(*) as count FROM jobapplications GROUP BY status'),
      db.connection?.get<{ count: number }>('SELECT COUNT(*) as count FROM supporttickets'),
      db.connection?.all<{ status: string; count: number }[]>('SELECT status, COUNT(*) as count FROM supporttickets GROUP BY status')
    ]);

    const byRole: Record<string, number> = {};
    usersByRole?.forEach(r => { byRole[r.main_role] = r.count; });

    const byJobStatus: Record<string, number> = {};
    jobsByStatus?.forEach(s => { byJobStatus[s.status] = s.count; });

    const appsByStatus: Record<string, number> = { Pending: 0, Accepted: 0, Rejected: 0 };
    applicationsByStatus?.forEach(s => { appsByStatus[s.status] = s.count; });

    const ticketStatus: Record<string, number> = { Open: 0, 'In Progress': 0, Escalated: 0, Resolved: 0, Closed: 0 };
    ticketsByStatus?.forEach(s => { ticketStatus[s.status] = s.count; });

    return {
      users: {
        total: totalUsers?.count || 0,
        byRole,
        blocked: blockedUsers?.count || 0,
        newThisWeek: usersThisWeek?.count || 0,
        newThisMonth: usersThisMonth?.count || 0
      },
      jobs: {
        total: totalJobs?.count || 0,
        byStatus: byJobStatus,
        newThisWeek: jobsThisWeek?.count || 0,
        newThisMonth: jobsThisMonth?.count || 0,
        hidden: hiddenJobs?.count || 0
      },
      applications: {
        total: totalApplications?.count || 0,
        pending: appsByStatus.Pending,
        accepted: appsByStatus.Accepted,
        rejected: appsByStatus.Rejected
      },
      tickets: {
        total: totalTickets?.count || 0,
        open: ticketStatus.Open,
        inProgress: ticketStatus['In Progress'],
        escalated: ticketStatus.Escalated,
        resolved: ticketStatus.Resolved + ticketStatus.Closed
      }
    };
  },

  async getRevenueStats(period: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<RevenueStats> {
    let dateFilter = '';
    let groupBy = '';
    
    switch (period) {
      case 'week':
        dateFilter = "AND created_at >= datetime('now', '-7 days')";
        groupBy = "strftime('%Y-%m-%d', created_at)";
        break;
      case 'month':
        dateFilter = "AND created_at >= datetime('now', '-30 days')";
        groupBy = "strftime('%Y-%m-%d', created_at)";
        break;
      case 'year':
        dateFilter = "AND created_at >= datetime('now', '-365 days')";
        groupBy = "strftime('%Y-%m', created_at)";
        break;
      default:
        groupBy = "strftime('%Y-%m', created_at)";
    }

    const [totals, byPeriod] = await Promise.all([
      db.connection?.get<{
        total: number;
        completed: number;
        pending: number;
        failed: number;
        refunded: number;
        avg: number;
      }>(`
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END), 0) as refunded,
          COALESCE(AVG(CASE WHEN status = 'completed' THEN amount END), 0) as avg
        FROM payments WHERE 1=1 ${dateFilter}
      `),
      db.connection?.all<{ period: string; amount: number; count: number }[]>(`
        SELECT 
          ${groupBy} as period,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as amount,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as count
        FROM payments 
        WHERE 1=1 ${dateFilter}
        GROUP BY ${groupBy}
        ORDER BY period ASC
      `)
    ]);

    return {
      totalRevenue: totals?.total || 0,
      completedPayments: totals?.completed || 0,
      pendingPayments: totals?.pending || 0,
      failedPayments: totals?.failed || 0,
      refundedAmount: totals?.refunded || 0,
      averagePaymentAmount: totals?.avg || 0,
      revenueByPeriod: byPeriod || []
    };
  },

  async getUserStats(period: 'week' | 'month' | 'year' = 'month'): Promise<UserStats> {
    let dateFilter = '';
    let groupBy = '';
    
    switch (period) {
      case 'week':
        dateFilter = "AND created_at >= datetime('now', '-7 days')";
        groupBy = "strftime('%Y-%m-%d', created_at)";
        break;
      case 'month':
        dateFilter = "AND created_at >= datetime('now', '-30 days')";
        groupBy = "strftime('%Y-%m-%d', created_at)";
        break;
      case 'year':
        dateFilter = "AND created_at >= datetime('now', '-365 days')";
        groupBy = "strftime('%Y-%m', created_at)";
        break;
    }

    const [total, growth, roles] = await Promise.all([
      db.connection?.get<{ count: number }>('SELECT COUNT(*) as count FROM users'),
      db.connection?.all<{ period: string; count: number }[]>(`
        SELECT ${groupBy} as period, COUNT(*) as count
        FROM users WHERE 1=1 ${dateFilter}
        GROUP BY ${groupBy}
        ORDER BY period ASC
      `),
      db.connection?.all<{ main_role: string; count: number }[]>('SELECT main_role, COUNT(*) as count FROM users GROUP BY main_role')
    ]);

    const roleDistribution: Record<string, number> = {};
    roles?.forEach(r => { roleDistribution[r.main_role] = r.count; });

    return {
      totalUsers: total?.count || 0,
      growthByPeriod: growth || [],
      roleDistribution,
      topEmployers: [],
      topFreelancers: []
    };
  },

  async getJobStats(period: 'week' | 'month' | 'year' = 'month'): Promise<JobStats> {
    let dateFilter = '';
    
    switch (period) {
      case 'week':
        dateFilter = "AND j.created_at >= datetime('now', '-7 days')";
        break;
      case 'month':
        dateFilter = "AND j.created_at >= datetime('now', '-30 days')";
        break;
      case 'year':
        dateFilter = "AND j.created_at >= datetime('now', '-365 days')";
        break;
    }

    const [total, byStatus, byCategory, avgBudget, byExperience, byType, completed] = await Promise.all([
      db.connection?.get<{ count: number }>(`SELECT COUNT(*) as count FROM jobs j WHERE 1=1 ${dateFilter}`),
      db.connection?.all<{ status: string; count: number }[]>(`SELECT status, COUNT(*) as count FROM jobs j WHERE 1=1 ${dateFilter} GROUP BY status`),
      db.connection?.all<{ category_id: number; name: string; count: number }[]>(`
        SELECT c.category_id, c.name, COUNT(j.job_id) as count
        FROM categories c
        LEFT JOIN jobs j ON c.category_id = j.category_id ${dateFilter.replace('AND j.', 'AND j.')}
        GROUP BY c.category_id
        ORDER BY count DESC
      `),
      db.connection?.get<{ avg: number }>(`SELECT AVG(budget) as avg FROM jobs j WHERE budget IS NOT NULL ${dateFilter}`),
      db.connection?.all<{ experience_level: string; count: number }[]>(`
        SELECT experience_level, COUNT(*) as count FROM jobs j 
        WHERE experience_level IS NOT NULL ${dateFilter} 
        GROUP BY experience_level
      `),
      db.connection?.get<{ fixed: number; hourly: number }>(`
        SELECT 
          COUNT(CASE WHEN job_type = 'fixed' THEN 1 END) as fixed,
          COUNT(CASE WHEN job_type = 'hourly' THEN 1 END) as hourly
        FROM jobs j WHERE 1=1 ${dateFilter}
      `),
      db.connection?.get<{ total: number; completed: number }>(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed
        FROM jobs j WHERE 1=1 ${dateFilter}
      `)
    ]);

    const jobsByStatus: Record<string, number> = {};
    byStatus?.forEach(s => { jobsByStatus[s.status] = s.count; });

    const jobsByExperienceLevel: Record<string, number> = {};
    byExperience?.forEach(e => { jobsByExperienceLevel[e.experience_level] = e.count; });

    const completionRate = completed?.total ? (completed.completed / completed.total) * 100 : 0;

    return {
      totalJobs: total?.count || 0,
      jobsByStatus,
      jobsByCategory: byCategory || [],
      averageBudget: avgBudget?.avg || 0,
      jobsByExperienceLevel,
      jobsByType: { fixed: byType?.fixed || 0, hourly: byType?.hourly || 0 },
      completionRate: Math.round(completionRate * 100) / 100
    };
  }
};
