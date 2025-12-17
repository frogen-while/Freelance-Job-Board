import { Router } from 'express';
import { createJobApplication, getAllJobApplications, getJobApplicationById, deleteJobApplication, updateJobApplication} from '../controllers/jobaplController.js';

const router = Router();

router.post('/', createJobApplication); 
router.get('/', getAllJobApplications);
router.get('/:id', getJobApplicationById);
router.delete('/:id', deleteJobApplication);
router.put('/:id', updateJobApplication);

export default router;