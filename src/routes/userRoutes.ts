import { Router } from 'express';
import { getAllUsers, registerUser, getUserById, deleteUser, updateUser} from '../controllers/userController.js';

const router = Router();

router.post('/', registerUser); 
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.delete('/:id', deleteUser);
router.put('/:id', updateUser);

export default router;