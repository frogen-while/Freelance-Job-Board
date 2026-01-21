import { Router } from 'express';
import { asyncHandler } from '../utils/http.js';
import { getAllUsers, registerUser, getUserById, deleteUser, updateUser} from '../controllers/userController.js';

const router = Router();

router.post('/', asyncHandler(registerUser));
router.get('/', asyncHandler(getAllUsers));
router.get('/:id', asyncHandler(getUserById));
router.delete('/:id', asyncHandler(deleteUser));
router.put('/:id', asyncHandler(updateUser));

export default router;