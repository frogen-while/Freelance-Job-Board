import { db } from '../config/init_db.js';
import { User, MainRole } from '../interfaces/User.js';

export const userRepo = {
    async findByEmail(email: string): Promise<User | undefined> {
        return await db.connection?.get<User | undefined>(
            `SELECT * FROM users WHERE email = ?`, 
            email
        );
    },
    

    async create(name: string, email: string, password_hash: string): Promise<number | null> {
        const main_role: MainRole = 'Regular'; 
        
        const result = await db.connection?.run(
            `INSERT INTO users (name, email, password_hash, main_role) VALUES (?, ?, ?, ?)`,
            name, email, password_hash, main_role
        );
        
        return result?.lastID ?? null; 
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

    async update(userId: number, updateData: { name?: string, main_role?: string }): Promise<boolean> {
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

        if (setClauses.length === 0) {
            return false; 
        }

        params.push(userId);
        const statement = `UPDATE users SET ${setClauses.join(', ')} WHERE user_id = ?`;
        const result = await db.connection?.run(statement, params);
        return (result?.changes ?? 0) > 0;
    }
};