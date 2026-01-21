import { Router } from 'express';
import { getAllAssignments, createAssignment, getAssignmentById, updateAssignment, deleteAssignment, getAssignmentsByFreelancerId, getAssignmentsByEmployerId, uploadAssignmentDeliverable, getAssignmentDeliverables, reviewAssignmentDeliverable, updateAssignmentStatus } from '../controllers/assignmentController.js';
import { asyncHandler } from '../utils/http.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/freelancer/:freelancerId', requireAuth, asyncHandler(getAssignmentsByFreelancerId));
router.get('/employer/:employerId', requireAuth, asyncHandler(getAssignmentsByEmployerId));
router.get('/:id/deliverables', requireAuth, asyncHandler(getAssignmentDeliverables));
router.post('/:id/deliverables', requireAuth, asyncHandler(uploadAssignmentDeliverable));
router.patch('/deliverables/:deliverableId', requireAuth, asyncHandler(reviewAssignmentDeliverable));
router.patch('/:id/status', requireAuth, asyncHandler(updateAssignmentStatus));

router.post('/', requireAuth, asyncHandler(createAssignment));
router.get('/', requireAuth, asyncHandler(getAllAssignments));
router.get('/:id', requireAuth, asyncHandler(getAssignmentById));
router.delete('/:id', requireAuth, asyncHandler(deleteAssignment));
router.put('/:id', requireAuth, asyncHandler(updateAssignment));

export default router;