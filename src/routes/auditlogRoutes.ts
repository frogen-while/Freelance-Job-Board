import { Router } from 'express';
import {getAllAuditLogs, getAuditLogById} from '../controllers/auditlogController.js';

const router = Router();

router.get('/', getAllAuditLogs);
router.get('/:id', getAuditLogById);


export default router;