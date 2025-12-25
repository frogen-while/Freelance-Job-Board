import { Request, Response } from 'express';
import { paymentsRepo } from '../repositories/paymentsRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { jobRepo } from '../repositories/jobRepo.js';
import { status } from '../interfaces/Payments.js';
import { sendError, sendSuccess } from '../utils/http.js';

export const createPayment = async (req: Request, res: Response) => {
    const {job_id, payer_id, receiver_id, amount, status} = req.body;

    if (job_id === undefined || payer_id === undefined || receiver_id === undefined || amount === undefined || !status) {
        return sendError(res, 400, 'job_id, payer_id, receiver_id, amount and status are required.');
    }

    if (!['Pending', 'Paid', 'Failed'].includes(status)) {
        return sendError(res, 400, 'status must be Pending, Paid, or Failed.');
    }

    if (amount <= 0) {
        return sendError(res, 400, 'amount must be greater than 0.');
    }

    try {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return sendError(res, 400, 'job_id does not reference an existing job.');
        }

        const payer = await userRepo.findById(payer_id);
        if (!payer) {
            return sendError(res, 400, 'payer_id does not reference an existing user.');
        }

        const receiver = await userRepo.findById(receiver_id);
        if (!receiver) {
            return sendError(res, 400, 'receiver_id does not reference an existing user.');
        }

        const newPaymentId = await paymentsRepo.create(job_id, payer_id, receiver_id, amount, status);

        if (newPaymentId) {
            return sendSuccess(res, { payment_id: newPaymentId }, 201);
        } else {
            return sendError(res, 500, 'Failed to create payment.');
        }

    } catch (error) {
        console.error('creation error:', error);
        return sendError(res, 500, 'An internal server error occurred during payment creation.');
    }
};

export const getAllPayments = async (req: Request, res: Response) => {
    try {
        const data = await paymentsRepo.get_all()

        return sendSuccess(res, data);
    } catch (error){
        console.error('Error fetching payments', error)
        return sendError(res, 500, 'An internal server error occurred while fetching payments.');
    }
};

export const getPaymentById = async (req: Request, res: Response) => {
    const paymentId = parseInt(req.params.id, 10); 

    if (isNaN(paymentId)) {
        return sendError(res, 400, 'Invalid payment ID format.');
    }

    try {
        const payment = await paymentsRepo.findById(paymentId);

        if (!payment) {
            return sendError(res, 404, 'Payment not found.');
        }

        return sendSuccess(res, payment);

    } catch (error) {
        console.error(`Error fetching payment ${paymentId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while fetching the payment.');
    }
};

export const deletePayment = async(req: Request, res: Response) =>{
    const paymentId = parseInt(req.params.id, 10); 

    if (isNaN(paymentId)) {
        return sendError(res, 400, 'Invalid payment ID format.');
    }

    try {
        await paymentsRepo.deleteByID(paymentId)
        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error deleting payment ${paymentId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while deleting the payment.');
    }

};

export const updatePayment = async (req: Request, res: Response) => {
    const paymentId = parseInt(req.params.id, 10);
    const { job_id, payer_id, receiver_id, amount, status} = req.body; 

    if (isNaN(paymentId)) {
        return sendError(res, 400, 'Invalid payment ID format.');
    }

    const updateData: {job_id?: number, payer_id?: number, receiver_id?: number, amount?: number, status?: status} = {};
    
    if (job_id !== undefined) {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return sendError(res, 400, 'job_id does not reference an existing job.');
        }
        updateData.job_id = job_id;
    }
    if (payer_id !== undefined) {
        const payer = await userRepo.findById(payer_id);
        if (!payer) {
            return sendError(res, 400, 'payer_id does not reference an existing user.');
        }
        updateData.payer_id = payer_id;
    }
    if (receiver_id !== undefined) {
        const receiver = await userRepo.findById(receiver_id);
        if (!receiver) {
            return sendError(res, 400, 'receiver_id does not reference an existing user.');
        }
        updateData.receiver_id = receiver_id;
    }
    if (amount !== undefined) {
        if (amount <= 0) {
            return sendError(res, 400, 'amount must be greater than 0.');
        }
        updateData.amount = amount;
    }
    if (status !== undefined) {
        if (!['Pending', 'Paid', 'Failed'].includes(status)) {
            return sendError(res, 400, 'status must be Pending, Paid, or Failed.');
        }
        updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update (allowed: job_id, payer_id, receiver_id, amount, status)')
    }
    
    try {
        const existingPayment = await paymentsRepo.findById(paymentId);
        if (!existingPayment) {
            return sendError(res, 404, 'Payment not found.');
        }
        
        const success = await paymentsRepo.update(paymentId, updateData);

        if (success) {
            return sendSuccess(res, { message: 'Payment updated successfully.' });
        } else {
            return sendError(res, 500, 'Failed to update payment.');
        }
    } catch (error) {
        console.error(`Error updating payment ${paymentId}:`, error);
        return sendError(res, 500, 'An internal server error occurred while updating the payment.');
    }
};