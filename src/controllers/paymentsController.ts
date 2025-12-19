import { Request, Response } from 'express';
import { paymentsRepo } from '../repositories/paymentsRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { jobRepo } from '../repositories/jobRepo.js';
import { status } from '../interfaces/Payments.js';

export const createPayment = async (req: Request, res: Response) => {
    const {job_id, payer_id, receiver_id, amount, status} = req.body;

    if (job_id === undefined || payer_id === undefined || receiver_id === undefined || amount === undefined || !status) {
        return res.status(400).json({ error: 'job_id, payer_id, receiver_id, amount and status are required.' });
    }

    if (!['Pending', 'Paid', 'Failed'].includes(status)) {
        return res.status(400).json({ error: 'status must be Pending, Paid, or Failed.' });
    }

    if (amount <= 0) {
        return res.status(400).json({ error: 'amount must be greater than 0.' });
    }

    try {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return res.status(400).json({ error: 'job_id does not reference an existing job.' });
        }

        const payer = await userRepo.findById(payer_id);
        if (!payer) {
            return res.status(400).json({ error: 'payer_id does not reference an existing user.' });
        }

        const receiver = await userRepo.findById(receiver_id);
        if (!receiver) {
            return res.status(400).json({ error: 'receiver_id does not reference an existing user.' });
        }

        const newPaymentId = await paymentsRepo.create(job_id, payer_id, receiver_id, amount, status);

        if (newPaymentId) {
            return res.status(201).json({ 
                message: 'Payment successfully created.', 
                payment_id: newPaymentId,
                amount: amount
            });
        } else {
            return res.status(500).json({ error: 'Failed to create payment.' });
        }

    } catch (error) {
        console.error('creation error:', error);
        return res.status(500).json({ error: 'An internal server error occurred during payment creation.' });
    }
};

export const getAllPayments = async (req: Request, res: Response) => {
    try {
        const data = await paymentsRepo.get_all()

        return res.status(200).json(
        {
            data
        });
    } catch (error){
        console.error('Error fetching payments', error)
        return res.status(500).json({ error: 'An internal server error occurred while fetching payments.' });
    }
};

export const getPaymentById = async (req: Request, res: Response) => {
    const paymentId = parseInt(req.params.id, 10); 

    if (isNaN(paymentId)) {
        return res.status(400).json({ error: 'Invalid payment ID format.' });
    }

    try {
        const payment = await paymentsRepo.findById(paymentId);

        if (!payment) {
            return res.status(404).json({ error: 'payment not found.' });
        }

        return res.status(200).json({ data: payment });

    } catch (error) {
        console.error(`Error fetching payment ${paymentId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while fetching the payment.' });
    }
};

export const deletePayment = async(req: Request, res: Response) =>{
    const paymentId = parseInt(req.params.id, 10); 

    if (isNaN(paymentId)) {
        return res.status(400).json({ error: 'Invalid payment ID format.' });
    }

    try {
        await paymentsRepo.deleteByID(paymentId)
        return res.status(204).send();
    } catch (error) {
        console.error(`Error deleting payment ${paymentId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while deleting the payment.' });
    }

};

export const updatePayment = async (req: Request, res: Response) => {
    const paymentId = parseInt(req.params.id, 10);
    const { job_id, payer_id, receiver_id, amount, status} = req.body; 

    if (isNaN(paymentId)) {
        return res.status(400).json({ error: 'Invalid payment ID format.' });
    }

    const updateData: {job_id?: number, payer_id?: number, receiver_id?: number, amount?: number, status?: status} = {};
    
    if (job_id !== undefined) {
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return res.status(400).json({ error: 'job_id does not reference an existing job.' });
        }
        updateData.job_id = job_id;
    }
    if (payer_id !== undefined) {
        const payer = await userRepo.findById(payer_id);
        if (!payer) {
            return res.status(400).json({ error: 'payer_id does not reference an existing user.' });
        }
        updateData.payer_id = payer_id;
    }
    if (receiver_id !== undefined) {
        const receiver = await userRepo.findById(receiver_id);
        if (!receiver) {
            return res.status(400).json({ error: 'receiver_id does not reference an existing user.' });
        }
        updateData.receiver_id = receiver_id;
    }
    if (amount !== undefined) {
        if (amount <= 0) {
            return res.status(400).json({ error: 'amount must be greater than 0.' });
        }
        updateData.amount = amount;
    }
    if (status !== undefined) {
        if (!['Pending', 'Paid', 'Failed'].includes(status)) {
            return res.status(400).json({ error: 'status must be Pending, Paid, or Failed.' });
        }
        updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update (allowed: job_id, payer_id, receiver_id, amount, status)' })
    }
    
    try {
        const existingPayment = await paymentsRepo.findById(paymentId);
        if (!existingPayment) {
            return res.status(404).json({ error: 'payment not found.' });
        }
        
        const success = await paymentsRepo.update(paymentId, updateData);

        if (success) {
            return res.status(200).json({ message: 'payment updated successfully.' });
        } else {
            return res.status(500).json({ error: 'Failed to update payment.' });
        }
    } catch (error) {
        console.error(`Error updating payment ${paymentId}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred while updating the payment.' });
    }
};