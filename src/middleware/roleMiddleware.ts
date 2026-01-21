import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';
import { sendError } from '../utils/http.js';
import { userRepo } from '../repositories/userRepo.js';

export type Role = 'Admin' | 'Manager' | 'Support' | 'Employer' | 'Freelancer';

const roleHierarchy: Record<Role, number> = {
  'Freelancer': 0,
  'Employer': 0,
  'Support': 1,
  'Manager': 2,
  'Admin': 3
};

export const requireRole = (...allowedRoles: Role[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const tokenUser = req.user;

    if (!tokenUser) {
      sendError(res, 401, 'Authentication required.');
      return;
    }

    try {
      const user = await userRepo.findById(tokenUser.sub);

      if (!user) {
        sendError(res, 401, 'User not found.');
        return;
      }

      if (user.is_blocked) {
        sendError(res, 403, 'Your account has been blocked.');
        return;
      }

      const userRole = user.main_role as Role;

      if (!allowedRoles.includes(userRole)) {
        sendError(res, 403, 'Insufficient permissions. Required roles: ' + allowedRoles.join(', '));
        return;
      }

      (req as any).currentUser = user;
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      sendError(res, 500, 'Authorization check failed.');
    }
  };
};

export const requireMinRole = (minRole: Role) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const tokenUser = req.user;

    if (!tokenUser) {
      sendError(res, 401, 'Authentication required.');
      return;
    }

    try {
      const user = await userRepo.findById(tokenUser.sub);

      if (!user) {
        sendError(res, 401, 'User not found.');
        return;
      }

      if (user.is_blocked) {
        sendError(res, 403, 'Your account has been blocked.');
        return;
      }

      const userRole = user.main_role as Role;
      const userLevel = roleHierarchy[userRole] ?? 0;
      const requiredLevel = roleHierarchy[minRole] ?? 0;

      if (userLevel < requiredLevel) {
        sendError(res, 403, `Insufficient permissions. Minimum required role: ${minRole}`);
        return;
      }

      (req as any).currentUser = user;
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      sendError(res, 500, 'Authorization check failed.');
    }
  };
};

export const requireOwnerOrAdmin = (getOwnerId: (req: AuthenticatedRequest) => Promise<number | null>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const tokenUser = req.user;

    if (!tokenUser) {
      sendError(res, 401, 'Authentication required.');
      return;
    }

    try {
      const user = await userRepo.findById(tokenUser.sub);

      if (!user) {
        sendError(res, 401, 'User not found.');
        return;
      }

      if (user.is_blocked) {
        sendError(res, 403, 'Your account has been blocked.');
        return;
      }

      if (['Admin', 'Manager'].includes(user.main_role)) {
        (req as any).currentUser = user;
        next();
        return;
      }

      const ownerId = await getOwnerId(req);
      if (ownerId === user.user_id) {
        (req as any).currentUser = user;
        next();
        return;
      }

      sendError(res, 403, 'Access denied. You can only access your own resources.');
    } catch (error) {
      console.error('Role middleware error:', error);
      sendError(res, 500, 'Authorization check failed.');
    }
  };
};

export const requireAdmin = requireRole('Admin');
export const requireManager = requireMinRole('Manager');
export const requireSupport = requireRole('Support', 'Manager', 'Admin');
export const requireEmployer = requireRole('Employer', 'Manager', 'Admin');
export const requireFreelancer = requireRole('Freelancer', 'Manager', 'Admin');
