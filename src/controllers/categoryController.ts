import { Request, Response } from 'express';
import { categoryRepo } from '../repositories/categoryRepo.js';
import { userRepo } from '../repositories/userRepo.js';


export const createCategory = async (req: Request, res: Response) => {
    const { name, description, manager_id } = req.body;

    if (!name || !description) {
        return res.status(400).json({ error: 'name and description are required.' });
    }

    try {

        let managerId: number | null = null;
        if (manager_id !== undefined && manager_id !== null) {
            const parsed = typeof manager_id === 'string' ? Number.parseInt(manager_id, 10) : manager_id;
            if (!Number.isInteger(parsed) || parsed <= 0) {
                return res.status(400).json({ error: 'manager_id must be a positive integer or null.' });
            }

            const managerUser = await userRepo.findById(parsed);
            if (!managerUser) {
                return res.status(400).json({ error: 'manager_id does not reference an existing user.' });
            }

            managerId = parsed;
        }

        const existingName = await categoryRepo.findByName(name);
        if (existingName) {
            return res.status(409).json({ error: 'Category with this name already exists.' });
        }

        const newCategoryID= await categoryRepo.create(name, description, managerId);

        if (newCategoryID) {
            return res.status(201).json({ 
                message: 'Category successfully registered.', 
                name: name ,
                description: description,
                manager_id: managerId
            });
        } else {
            return res.status(500).json({ error: 'Failed to create category.' });
        }

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'An internal server error occurred during registration.' });
    }
};

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const data = await categoryRepo.get_all()

        return res.status(200).json(
        {
            data
        });
    } catch (error){
        console.error('Error fetching Categories', error)
        return res.status(500).json({ error: 'An internal server error occurred while fetching categories.' });
    }
    

};
export const getCategoryById = async (req: Request, res: Response) => {
    const CategoryId = parseInt(req.params.id, 10); 

    if (isNaN(CategoryId)) {
        return res.status(400).json({ error: 'Invalid category ID format.' });
    }

    try {
        const category = await categoryRepo.findById(CategoryId);

        if (!category) {
            return res.status(404).json({ error: 'Category not found.' });
        }

        return res.status(200).json({ data: category });

    } catch (error) {
        console.error(`Error fetching category ${CategoryId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while fetching the category.' });
    }
};
export const deleteCategory = async(req: Request, res: Response) =>{
    const CategoryId = parseInt(req.params.id, 10); 

    if (isNaN(CategoryId)) {
        return res.status(400).json({ error: 'Invalid Category ID format.' });
    }

    try {
        await categoryRepo.deleteByID(CategoryId)
        return res.status(204).send();
    } catch (error) {
        console.error(`Error fetching category ${CategoryId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while deleting the category.' });
    }

};

export const updateCategory = async (req: Request, res: Response) => {
    const CategoryId = parseInt(req.params.id, 10);
    const { name, description, manager_id } = req.body; 

    if (isNaN(CategoryId)) {
        return res.status(400).json({ error: 'Invalid category ID format.' });
    }

    const updateData: { name?: string, description?: string, manager_id?: number | null } = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (manager_id !== undefined) {
        if (manager_id === null) {
            updateData.manager_id = null;
        } else {
            const parsed = typeof manager_id === 'string' ? Number.parseInt(manager_id, 10) : manager_id;
            if (!Number.isInteger(parsed) || parsed <= 0) {
                return res.status(400).json({ error: 'manager_id must be a positive integer or null.' });
            }

            const managerUser = await userRepo.findById(parsed);
            if (!managerUser) {
                return res.status(400).json({ error: 'manager_id does not reference an existing user.' });
            }

            updateData.manager_id = parsed;
        }
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update (allowed: name, description, manager_id).' });
    }

    try {
        const existingCategory = await categoryRepo.findById(CategoryId);
        if (!existingCategory) {
            return res.status(404).json({ error: 'Category not found.' });
        }
        
        const success = await categoryRepo.update(CategoryId, updateData);

        if (success) {
            return res.status(200).json({ message: 'Category updated successfully.' });
        } else {
            return res.status(500).json({ error: 'Failed to update Category.' });
        }
    } catch (error) {
        console.error(`Error updating category ${CategoryId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while updating the category.' });
    }
};