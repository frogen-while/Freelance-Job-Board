import { db } from '../config/init_db.js';
import { Auditlog } from '../interfaces/Auditlog.js';

export const auditlogRepo = {

    async get_all(): Promise<Auditlog[]> {
        const result = await db.connection?.all<Auditlog[]>(
            'SELECT log_id, user_id, action, entity, entity_id, timestamp FROM auditlog'
        );
        return result || [];
    },
    
    async findById(log_id: number): Promise<Auditlog | undefined> {
        return await db.connection?.get<Auditlog | undefined>(
            `SELECT * FROM auditlog WHERE log_id = ?`,
            log_id
        );
    }

}