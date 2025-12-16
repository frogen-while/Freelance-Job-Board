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
    }
};