import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { userRepo } from '../repositories/userRepo.js';

const SALT_ROUNDS = 10; 


export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    try {

        const existingUser = await userRepo.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists.' });
        }


        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        const newUserId = await userRepo.create(name, email, password_hash);

        if (newUserId) {
            return res.status(201).json({ 
                message: 'User successfully registered.', 
                user_id: newUserId,
                email: email
            });
        } else {
            return res.status(500).json({ error: 'Failed to create user.' });
        }

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'An internal server error occurred during registration.' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const data = await userRepo.get_all()

        return res.status(200).json(
        {
            data
        });
    } catch (error){
        console.error('Error fetching Users', error)
        return res.status(500).json({ error: 'An internal server error occurred while fetching users.' });
    }
    

};
export const getUserById = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10); 

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format.' });
    }

    try {
        const user = await userRepo.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        return res.status(200).json({ data: user });

    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while fetching the user.' });
    }
};
export const deleteUser = async(req: Request, res: Response) =>{
    const userId = parseInt(req.params.id, 10); 

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format.' });
    }

    try {
        await userRepo.deleteByID(userId)
        return res.status(204);
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while fetching the user.' });
    }

};

export const updateUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10);
    const { name, main_role } = req.body; 

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format.' });
    }

    const updateData: { name?: string, main_role?: string } = {};
    if (name) updateData.name = name;
    if (main_role) updateData.main_role = main_role;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update (allowed: name, main_role).' });
    }

    try {
        const existingUser = await userRepo.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found.' });
        }
        
        const success = await userRepo.update(userId, updateData);

        if (success) {
            return res.status(200).json({ message: 'User updated successfully.' });
        } else {
            return res.status(500).json({ error: 'Failed to update user.' });
        }
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while updating the user.' });
    }
};