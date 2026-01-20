import { Request, Response } from 'express';
import { userRepo } from '../repositories/userRepo.js';
import { parseIdParam, rethrowHttpError, sendError, sendSuccess } from '../utils/http.js';
import bcrypt from 'bcrypt';



export const registerUser = async (req: Request, res: Response) => {
    const { first_name, last_name, email, password, main_role } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return sendError(res, 400, 'First name, last name, email and password are required.');
    }

    if (typeof password !== 'string' || password.length < 8) {
        return sendError(res, 400, 'Password must be at least 8 characters.');
    }

    if (main_role && !['Employer', 'Freelancer'].includes(main_role)) {
        return sendError(res, 400, 'main_role must be one of: Employer, Freelancer.');
    }

    try {

        const existingUser = await userRepo.findByEmail(email);
        if (existingUser) {
            return sendError(res, 409, 'User with this email already exists.');
        }


        const password_hash = await bcrypt.hash(password, 10);
        const newUserId = await userRepo.create(String(first_name), String(last_name), String(email).toLowerCase(), password_hash, main_role);

        if (newUserId) {
            return sendSuccess(res, { user_id: newUserId, email: String(email).toLowerCase() }, 201);
        } else {
            return sendError(res, 500, 'Failed to create user.');
        }

    } catch (error) {
        console.error('Registration error:', error);
        rethrowHttpError(error, 500, 'An internal server error occurred during registration.');
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const data = await userRepo.get_all()

        return sendSuccess(res, data);
    } catch (error){
        console.error('Error fetching Users', error)
        rethrowHttpError(error, 500, 'An internal server error occurred while fetching users.');
    }
    

};
export const getUserById = async (req: Request, res: Response) => {
    const userId = parseIdParam(res, req.params.id, 'user');
    if (userId === null) return;

    try {
        const user = await userRepo.findById(userId);

        if (!user) {
            return sendError(res, 404, 'User not found.');
        }

        return sendSuccess(res, user);

    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while fetching the user.');
    }
};
export const deleteUser = async(req: Request, res: Response) =>{
    const userId = parseIdParam(res, req.params.id, 'user');
    if (userId === null) return;

    try {
        await userRepo.deleteByID(userId)
        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while deleting the user.');
    }

};

export const updateUser = async (req: Request, res: Response) => {
    const userId = parseIdParam(res, req.params.id, 'user');
    const { first_name, last_name, main_role } = req.body; 
    if (userId === null) return;

    if (main_role && !['Admin', 'Manager', 'Support', 'Employer', 'Freelancer'].includes(main_role)) {
        return sendError(res, 400, 'main_role must be one of: Admin, Manager, Support, Employer, Freelancer.');
    }

    const updateData: { first_name?: string, last_name?: string, main_role?: string } = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (main_role) updateData.main_role = main_role;

    if (Object.keys(updateData).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update (allowed: first_name, last_name, main_role).');
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
        rethrowHttpError(error, 500, 'An internal server error occurred while updating the user.');
    }
};