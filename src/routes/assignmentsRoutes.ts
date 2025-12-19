import { Router } from 'express';
import { getAllAssignments, createAssignment, getAssignmentById, updateAssignment, deleteAssignment} from '../controllers/assignmentController.js';

const router = Router();

router.post('/', createAssignment); 
router.get('/', getAllAssignments);
router.get('/:id', getAssignmentById);
router.delete('/:id', deleteAssignment);
router.put('/:id', updateAssignment);

export default router;