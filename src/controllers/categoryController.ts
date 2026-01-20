import { Request, Response } from 'express';
import { categoryRepo } from '../repositories/categoryRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { parseIdParam, sendError, sendSuccess } from '../utils/http.js';


export const createCategory = async (req: Request, res: Response) => {
    const { name, description, manager_id } = req.body;

    if (!name || !description) {
        return sendError(res, 400, 'name and description are required.');
    }

    try {

        let managerId: number | null = null;
        if (manager_id !== undefined && manager_id !== null) {
            const parsed = typeof manager_id === 'string' ? Number.parseInt(manager_id, 10) : manager_id;
            if (!Number.isInteger(parsed) || parsed <= 0) {
                return sendError(res, 400, 'manager_id must be a positive integer or null.');
            }

            const managerUser = await userRepo.findById(parsed);
            if (!managerUser) {
                return sendError(res, 400, 'manager_id does not reference an existing user.');
            }

            managerId = parsed;
        }

        const existingName = await categoryRepo.findByName(name);
        if (existingName) {
            return sendError(res, 409, 'Category with this name already exists.');
        }

        const newCategoryID= await categoryRepo.create(name, description, managerId);

        if (newCategoryID) {
            return sendSuccess(res, { category_id: newCategoryID, name, description, manager_id: managerId }, 201);
        } else {
            return sendError(res, 500, 'Failed to create category.');
        }

    } catch (error) {
        console.error('Error creating category:', error);
        return sendError(res, 500, 'An internal server error occurred while creating the category.');
    }
};

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const data = await categoryRepo.get_all()

        return sendSuccess(res, data);
    } catch (error){
        console.error('Error fetching Categories', error)
        return sendError(res, 500, 'An internal server error occurred while fetching categories.');
    }
    

};
export const getCategoryById = async (req: Request, res: Response) => {
    const CategoryId = parseIdParam(res, req.params.id, 'category');
    if (CategoryId === null) {
        return;
    }

    try {
        const category = await categoryRepo.findById(CategoryId);

        if (!category) {
            return sendError(res, 404, 'Category not found.');
        }

        return sendSuccess(res, category);

    } catch (error) {
        console.error(`Error fetching category ${CategoryId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while fetching the category.');
    }
};
export const deleteCategory = async(req: Request, res: Response) =>{
    const CategoryId = parseIdParam(res, req.params.id, 'category');
    if (CategoryId === null) {
        return;
    }

    try {
        await categoryRepo.deleteByID(CategoryId)
        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error fetching category ${CategoryId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while deleting the category.');
    }

};

export const updateCategory = async (req: Request, res: Response) => {
    const CategoryId = parseIdParam(res, req.params.id, 'category');
    const { name, description, manager_id } = req.body; 
    if (CategoryId === null) {
        return;
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
                return sendError(res, 400, 'manager_id must be a positive integer or null.');
            }

            const managerUser = await userRepo.findById(parsed);
            if (!managerUser) {
                return sendError(res, 400, 'manager_id does not reference an existing user.');
            }

            updateData.manager_id = parsed;
        }
    }

    if (Object.keys(updateData).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update (allowed: name, description, manager_id).');
    }

    try {
        const existingCategory = await categoryRepo.findById(CategoryId);
        if (!existingCategory) {
            return sendError(res, 404, 'Category not found.');
        }
        
        const success = await categoryRepo.update(CategoryId, updateData);

        if (success) {
            return sendSuccess(res, { message: 'Category updated successfully.' });
        } else {
            return sendError(res, 500, 'Failed to update Category.');
        }
    } catch (error) {
        console.error(`Error updating category ${CategoryId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while updating the category.');
    }
};