import { Router } from 'express';
import { createJob, getAllJobs, getJobById, getJobsByEmployerId, updateJob, deleteJob} from '../controllers/jobController.js';

const router = Router();

router.post('/', createJob); 
router.get('/', getAllJobs);
router.get('/employer/:employerId', getJobsByEmployerId);
router.get('/:id', getJobById);
router.delete('/:id', deleteJob);
router.put('/:id', updateJob);

export default router;