import { db } from '../config/init_db.js';
import { Category } from '../interfaces/Category.js';

export const categoryRepo = {
    async findByName(name: string): Promise<Category | undefined> {
        return await db.connection?.get<Category | undefined>(
            'SELECT * FROM categories WHERE name = ?',
            name
        )
    },
    async get_all(): Promise<Category[]> {
            const result = await db.connection?.all<Category[]>(
                'SELECT category_id, name, description, manager_id FROM categories'
            );
            return result || [];
        },
    async create(name: string, description: string, manager_id: number | null): Promise<number | null> {

            const result = await db.connection?.run(
                `INSERT INTO categories (name, description, manager_id) VALUES (?, ?, ?)`,
                name, description, manager_id
            );

            return result?.lastID ?? null;
        },
    async findById(category_id: number): Promise<Category | undefined> {
        return await db.connection?.get<Category | undefined>(
            `SELECT category_id, name, description, manager_id FROM categories WHERE category_id = ?`,
            category_id
        )

    },
    async update(category_id: number, updateData: { name?: string, description?: string, manager_id?: number | null}): Promise<boolean> {
        const setClauses: string[] = [];
        const params: (string | number | null)[] = [];

        if (updateData.name) {
            setClauses.push('name = ?');
            params.push(updateData.name);
        }
        if (updateData.description) {
            setClauses.push('description = ?');
            params.push(updateData.description);
        }
        if (updateData.manager_id !== undefined) {
            setClauses.push('manager_id = ?');
            params.push(updateData.manager_id);
        }

        if (setClauses.length === 0) {
            return false;
        }

        params.push(category_id);
        const statement = `UPDATE categories SET ${setClauses.join(', ')} WHERE category_id = ?`;
        const result = await db.connection?.run(statement, params);
        return (result?.changes ?? 0) > 0;
    },
    async deleteByID(category_id: number): Promise<void> {
        await db.connection?.run(
            'DELETE FROM categories WHERE category_id = ?',
            category_id
        );
    }
}