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

