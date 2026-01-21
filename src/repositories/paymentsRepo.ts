import { db } from '../config/init_db.js';
import { Payment } from '../interfaces/Payments.js';

export const paymentsRepo = {

    async get_all(): Promise<Payment[]> {
        const result = await db.connection?.all<Payment[]>(
            'SELECT payment_id, job_id, payer_id, payee_id, amount, created_at FROM payments'
        );
        return result || [];
    },

    async create(job_id: number, payer_id: number, payee_id: number, amount: number): Promise<number | null> {
        const result = await db.connection?.run(
            `INSERT INTO payments (job_id, payer_id, payee_id, amount) VALUES (?, ?, ?, ?)`,
            job_id, payer_id, payee_id, amount
        );

        return result?.lastID ?? null;
    },

    async findById(payment_id: number): Promise<Payment | undefined> {
        return await db.connection?.get<Payment | undefined>(
            `SELECT * FROM payments WHERE payment_id = ?`,
            payment_id
        );
    },

    async update(payment_id: number, updateData: { job_id?: number, payer_id?: number, payee_id?: number, amount?: number }): Promise<boolean> {
        const setClauses: string[] = [];
        const params: (string | number)[] = [];

        if (updateData.job_id !== undefined) {
            setClauses.push('job_id = ?');
            params.push(updateData.job_id);
        }
        if (updateData.payer_id !== undefined) {
            setClauses.push('payer_id = ?');
            params.push(updateData.payer_id);
        }
        if (updateData.payee_id !== undefined) {
            setClauses.push('payee_id = ?');
            params.push(updateData.payee_id);
        }
        if (updateData.amount !== undefined) {
            setClauses.push('amount = ?');
            params.push(updateData.amount);
        }

        if (setClauses.length === 0) {
            return false;
        }

        params.push(payment_id);
        const statement = `UPDATE payments SET ${setClauses.join(', ')} WHERE payment_id = ?`;
        const result = await db.connection?.run(statement, params);
        return (result?.changes ?? 0) > 0;
    },

    async deleteByID(payment_id: number): Promise<void> {
        await db.connection?.run(
            'DELETE FROM payments WHERE payment_id = ?',
            payment_id
        );
    }

}