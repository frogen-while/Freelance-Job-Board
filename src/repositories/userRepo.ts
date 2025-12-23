import { db } from '../config/init_db.js';
import { User, MainRole } from '../interfaces/User.js';

export const userRepo = {
    async findByEmail(email: string): Promise<User | undefined> {
        return await db.connection?.get<User | undefined>(
            `SELECT * FROM users WHERE email = ?`, 
            email
        );
    },
    

    async create(name: string, email: string, password_hash: string, type_name?: string): Promise<number | null> {
        const main_role: MainRole = 'Regular'; 
        
        const result = await db.connection?.run(
            `INSERT INTO users (name, email, password_hash, main_role) VALUES (?, ?, ?, ?)`,
            name, email, password_hash, main_role
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
            'SELECT user_id, name, email, main_role FROM users'
        );
        return result || [];
    },
    async findById(user_id: number): Promise<User | undefined> {
        return await db.connection?.get<User | undefined>(
            `SELECT user_id, name, email, main_role FROM users WHERE user_id = ?`,
            user_id
        );
    },
    async deleteByID(user_id: number): Promise<void> {
        await db.connection?.run(
            'DELETE FROM users WHERE user_id = ?',
            user_id
        );
    },

    async update(userId: number, updateData: { name?: string, main_role?: string, type_name?: string }): Promise<boolean> {
        const setClauses: string[] = [];
        const params: (string | number)[] = [];

        if (updateData.name) {
            setClauses.push('name = ?');
            params.push(updateData.name);
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