import { Request, Response } from 'express';
import { userRepo } from '../repositories/userRepo.js';
import { sendError, sendSuccess } from '../utils/http.js';
import bcrypt from 'bcrypt';



export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, type_name } = req.body;

    if (!name || !email || !password) {
        return sendError(res, 400, 'Name, email and password are required.');
    }

    if (typeof password !== 'string' || password.length < 8) {
        return sendError(res, 400, 'Password must be at least 8 characters.');
    }

    if (type_name && !['Employer', 'Freelancer', 'Reviewer', 'Support'].includes(type_name)) {
        return sendError(res, 400, 'type_name must be one of: Employer, Freelancer, Reviewer, Support.');
    }

    try {

        const existingUser = await userRepo.findByEmail(email);
        if (existingUser) {
            return sendError(res, 409, 'User with this email already exists.');
        }


        const password_hash = await bcrypt.hash(password, 10);
        const newUserId = await userRepo.create(name, String(email).toLowerCase(), password_hash, type_name);

        if (newUserId) {
            return sendSuccess(res, { user_id: newUserId, email: String(email).toLowerCase() }, 201);
        } else {
            return sendError(res, 500, 'Failed to create user.');
        }

    } catch (error) {
        console.error('Registration error:', error);
        return sendError(res, 500, 'An internal server error occurred during registration.');
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const data = await userRepo.get_all()

        return sendSuccess(res, data);
    } catch (error){
        console.error('Error fetching Users', error)
        return sendError(res, 500, 'An internal server error occurred while fetching users.');
    }
    

};
export const getUserById = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10); 

    if (isNaN(userId)) {
        return sendError(res, 400, 'Invalid user ID format.');
    }

    try {
        const user = await userRepo.findById(userId);

        if (!user) {
            return sendError(res, 404, 'User not found.');
        }

        return sendSuccess(res, user);

    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while fetching the user.');
    }
};
export const deleteUser = async(req: Request, res: Response) =>{
    const userId = parseInt(req.params.id, 10); 

    if (isNaN(userId)) {
        return sendError(res, 400, 'Invalid user ID format.');
    }

    try {
        await userRepo.deleteByID(userId)
        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while deleting the user.');
    }

};

export const updateUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10);
    const { name, main_role, type_name } = req.body; 

    if (isNaN(userId)) {
        return sendError(res, 400, 'Invalid user ID format.');
    }

    if (type_name && !['Employer', 'Freelancer', 'Reviewer', 'Support'].includes(type_name)) {
        return sendError(res, 400, 'type_name must be one of: Employer, Freelancer, Reviewer, Support.');
    }

    const updateData: { name?: string, main_role?: string, type_name?: string } = {};
    if (name) updateData.name = name;
    if (main_role) updateData.main_role = main_role;
    if (type_name) updateData.type_name = type_name;

    if (Object.keys(updateData).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update (allowed: name, main_role, type_name).');
    }

    try {
        const existingUser = await userRepo.findById(userId);
        if (!existingUser) {
            return sendError(res, 404, 'User not found.');
        }
        
        const success = await userRepo.update(userId, updateData);

        if (success) {
            return sendSuccess(res, { message: 'User updated successfully.' });
        } else {
            return sendError(res, 500, 'Failed to update user.');
        }
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while updating the user.');
    }
};