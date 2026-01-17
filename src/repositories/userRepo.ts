import { db } from '../config/init_db.js';
import { User, MainRole } from '../interfaces/User.js';

export const userRepo = {
    async findByEmail(email: string): Promise<User | undefined> {
        return await db.connection?.get<User | undefined>(
            `SELECT * FROM users WHERE email = ?`, 
            email
        );
    },
    

    async create(first_name: string, last_name: string, email: string, password_hash: string, main_role?: MainRole): Promise<number | null> {
        const role: MainRole = main_role || 'Freelancer'; 
        
        const result = await db.connection?.run(
            `INSERT INTO users (first_name, last_name, email, password_hash, main_role) VALUES (?, ?, ?, ?, ?)`,
            first_name, last_name, email, password_hash, role
        );
        
        const userId = result?.lastID ?? null;
        
        // Also add to user_usertypes if role is Employer or Freelancer
        if (userId && (role === 'Employer' || role === 'Freelancer')) {
            const typeRecord = await db.connection?.get<{type_id: number}>(
                'SELECT type_id FROM usertypes WHERE type_name = ?',
                role
            );
            if (typeRecord) {
                await db.connection?.run(
                    'INSERT INTO user_usertypes (user_id, type_id) VALUES (?, ?)',
                    userId,
                    typeRecord.type_id
                );
            }
        }
        
        return userId;
    },

    async get_all(): Promise<User[]> {
        const result = await db.connection?.all<User[]>(
            'SELECT user_id, first_name, last_name, email, main_role, status, is_blocked, created_at, updated_at FROM users'
        );
        return result || [];
    },

    async findById(user_id: number): Promise<User | undefined> {
        const user = await db.connection?.get<User | undefined>(
            `SELECT user_id, first_name, last_name, email, main_role, status, is_blocked, created_at, updated_at FROM users WHERE user_id = ?`,
            user_id
        );
        
        if (user) {
            // Load onboarding status
            const profile = await db.connection?.get<{onboarding_completed: number}>(
                `SELECT onboarding_completed FROM profiles WHERE user_id = ?`,
                user_id
            );
            (user as any).onboarding_completed = profile?.onboarding_completed === 1;
            
            // Load user_types
            const types = await db.connection?.all<{type_name: string}[]>(
                `SELECT ut.type_name FROM user_usertypes uut 
                 JOIN usertypes ut ON uut.type_id = ut.type_id 
                 WHERE uut.user_id = ?`,
                user_id
            );
            (user as any).user_types = types?.map(t => t.type_name) || [];
        }
        
        return user;
    },

    async deleteByID(user_id: number): Promise<void> {
        await db.connection?.run(
            'DELETE FROM users WHERE user_id = ?',
            user_id
        );
    },

    async update(userId: number, updateData: { first_name?: string, last_name?: string, main_role?: string }): Promise<boolean> {
        const setClauses: string[] = [];
        const params: (string | number)[] = [];

        if (updateData.first_name) {
            setClauses.push('first_name = ?');
            params.push(updateData.first_name);
        }
        if (updateData.last_name) {
            setClauses.push('last_name = ?');
            params.push(updateData.last_name);
        }
        if (updateData.main_role) {
            setClauses.push('main_role = ?');
            params.push(updateData.main_role);
        }

        if (setClauses.length === 0) {
            return false; 
        }

        setClauses.push('updated_at = CURRENT_TIMESTAMP');
        params.push(userId);
        const statement = `UPDATE users SET ${setClauses.join(', ')} WHERE user_id = ?`;
        const result = await db.connection?.run(statement, params);
        
        return (result?.changes ?? 0) > 0;
    },

    async updateBlockStatus(userId: number, isBlocked: boolean): Promise<boolean> {
        const result = await db.connection?.run(
            'UPDATE users SET is_blocked = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
            isBlocked ? 1 : 0,
            userId
        );
        return (result?.changes ?? 0) > 0;
    },

    async setLoginFailure(userId: number, failedAttempts: number, lockUntil: Date | null): Promise<void> {
        await db.connection?.run(
            'UPDATE users SET failed_attempts = ?, lock_until = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
            failedAttempts,
            lockUntil ? lockUntil.toISOString() : null,
            userId
        );
    },

    async resetLoginFailures(userId: number): Promise<void> {
        await db.connection?.run(
            'UPDATE users SET failed_attempts = 0, lock_until = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
            userId
        );
    },

    async bulkUpdateBlockStatus(userIds: number[], isBlocked: boolean): Promise<number> {
        if (userIds.length === 0) return 0;
        const placeholders = userIds.map(() => '?').join(',');
        const result = await db.connection?.run(
            `UPDATE users SET is_blocked = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id IN (${placeholders}) AND main_role != 'Admin'`,
            isBlocked ? 1 : 0,
            ...userIds
        );
        return result?.changes ?? 0;
    },

    async bulkUpdateRole(userIds: number[], role: MainRole, excludeRoles: MainRole[] = ['Admin']): Promise<number> {
        if (userIds.length === 0) return 0;
        const placeholders = userIds.map(() => '?').join(',');
        const excludePlaceholders = excludeRoles.map(() => '?').join(',');
        const result = await db.connection?.run(
            `UPDATE users SET main_role = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id IN (${placeholders}) AND main_role NOT IN (${excludePlaceholders})`,
            role,
            ...userIds,
            ...excludeRoles
        );
        return result?.changes ?? 0;
    }
};