import { db } from '../config/init_db.js';
import { User, MainRole } from '../interfaces/User.js';

export const userRepo = {
    async findByEmail(email: string): Promise<User | undefined> {
        return await db.connection?.get<User | undefined>(
            `SELECT * FROM users WHERE email = ?`, 
            email
        );
    },
    

    async create(first_name: string, last_name: string, email: string, password_hash: string, type_name?: string): Promise<number | null> {
        const main_role: MainRole = 'Regular'; 
        
        const result = await db.connection?.run(
            `INSERT INTO users (first_name, last_name, email, password_hash, main_role) VALUES (?, ?, ?, ?, ?)`,
            first_name, last_name, email, password_hash, main_role
        );
        
        const userId = result?.lastID;
        
        if (userId) {
            const userType = await db.connection?.get<{type_id: number}>(
                `SELECT type_id FROM usertypes WHERE type_name = ?`,
                type_name || 'Freelancer'
            );
            
            if (userType) {
                await db.connection?.run(
                    `INSERT INTO user_usertypes (user_id, type_id) VALUES (?, ?)`,
                    userId, userType.type_id
                );
            }
        }
        
        return userId ?? null; 
    },

    async get_all(): Promise<User[]> {
        const result = await db.connection?.all<User[]>(
            'SELECT user_id, first_name, last_name, email, main_role FROM users'
        );
        return result || [];
    },
    async findById(user_id: number): Promise<User | undefined> {
        const user = await db.connection?.get<User | undefined>(
            `SELECT user_id, first_name, last_name, email, main_role FROM users WHERE user_id = ?`,
            user_id
        );
        
        if (user) {
            // Get user types
            const types = await db.connection?.all<{type_name: string}[]>(
                `SELECT ut.type_name FROM usertypes ut 
                 JOIN user_usertypes uut ON ut.type_id = uut.type_id 
                 WHERE uut.user_id = ?`,
                user_id
            );
            (user as any).user_types = types?.map(t => t.type_name) || [];
            
            // Get onboarding status
            const profile = await db.connection?.get<{onboarding_completed: number}>(
                `SELECT onboarding_completed FROM profiles WHERE user_id = ?`,
                user_id
            );
            (user as any).onboarding_completed = profile?.onboarding_completed === 1;
        }
        
        return user;
    },
    async deleteByID(user_id: number): Promise<void> {
        await db.connection?.run(
            'DELETE FROM users WHERE user_id = ?',
            user_id
        );
    },

    async update(userId: number, updateData: { first_name?: string, last_name?: string, main_role?: string, type_name?: string }): Promise<boolean> {
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

        if (setClauses.length === 0 && !updateData.type_name) {
            return false; 
        }

        if (setClauses.length > 0) {
            params.push(userId);
            const statement = `UPDATE users SET ${setClauses.join(', ')} WHERE user_id = ?`;
            const result = await db.connection?.run(statement, params);
            
            if (!result || (result.changes ?? 0) === 0) {
                return false;
            }
        }
        
        if (updateData.type_name) {
            const userType = await db.connection?.get<{type_id: number}>(
                `SELECT type_id FROM usertypes WHERE type_name = ?`,
                updateData.type_name
            );
            
            if (userType) {
                await db.connection?.run('DELETE FROM user_usertypes WHERE user_id = ?', userId);
                await db.connection?.run(
                    'INSERT INTO user_usertypes (user_id, type_id) VALUES (?, ?)',
                    userId, userType.type_id
                );
            }
        }
        
        return true;
    }
};