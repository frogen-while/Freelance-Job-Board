import { Request, Response } from 'express';
import { paymentsRepo } from '../repositories/paymentsRepo.js';
import { userRepo } from '../repositories/userRepo.js';
import { jobRepo } from '../repositories/jobRepo.js';
import { jobAplRepo } from '../repositories/jobaplRepo.js';
import { parseIdParam, rethrowHttpError, sendError, sendSuccess } from '../utils/http.js';

export const createPayment = async (req: Request, res: Response) => {
    const { job_id, payer_id, payee_id, amount } = req.body;

    if (job_id === undefined || payer_id === undefined || payee_id === undefined || amount === undefined) {
        return sendError(res, 400, 'job_id, payer_id, payee_id, and amount are required.');
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

        const payee = await userRepo.findById(payee_id);
        if (!payee) {
            return sendError(res, 400, 'payee_id does not reference an existing user.');
        }

        const newPaymentId = await paymentsRepo.create(job_id, payer_id, payee_id, amount);

        if (newPaymentId) {
            return sendSuccess(res, { payment_id: newPaymentId }, 201);
        } else {
            return sendError(res, 500, 'Failed to create payment.');
        }

    } catch (error) {
        console.error('creation error:', error);
        rethrowHttpError(error, 500, 'An internal server error occurred during payment creation.');
    }
};

export const getAllPayments = async (req: Request, res: Response) => {
    try {
        const data = await paymentsRepo.get_all()

        return sendSuccess(res, data);
    } catch (error){
        console.error('Error fetching payments', error)
        rethrowHttpError(error, 500, 'An internal server error occurred while fetching payments.');
    }
};

export const getPaymentById = async (req: Request, res: Response) => {
    const paymentId = parseIdParam(res, req.params.id, 'payment');
    if (paymentId === null) return;

    try {
        const payment = await paymentsRepo.findById(paymentId);

        if (!payment) {
            return sendError(res, 404, 'Payment not found.');
        }

        return sendSuccess(res, payment);

    } catch (error) {
        console.error(`Error fetching payment ${paymentId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while fetching the payment.');
    }
};

export const deletePayment = async(req: Request, res: Response) =>{
    const paymentId = parseIdParam(res, req.params.id, 'payment');
    if (paymentId === null) return;

    try {
        await paymentsRepo.deleteByID(paymentId)
        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error deleting payment ${paymentId}:`, error);
        rethrowHttpError(error, 500, 'An internal server error occurred while deleting the payment.');
    }

};

export const updatePayment = async (req: Request, res: Response) => {
    const paymentId = parseIdParam(res, req.params.id, 'payment');
    const { job_id, payer_id, payee_id, amount } = req.body; 
    if (paymentId === null) return;

    const updateData: { job_id?: number, payer_id?: number, payee_id?: number, amount?: number } = {};
    
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
    if (payee_id !== undefined) {
        const payee = await userRepo.findById(payee_id);
        if (!payee) {
            return sendError(res, 400, 'payee_id does not reference an existing user.');
        }
        updateData.payee_id = payee_id;
    }
    if (amount !== undefined) {
        if (amount <= 0) {
            return sendError(res, 400, 'amount must be greater than 0.');
        }
        updateData.amount = amount;
    }

    if (Object.keys(updateData).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update (allowed: job_id, payer_id, payee_id, amount)')
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
        rethrowHttpError(error, 500, 'An internal server error occurred while updating the payment.');
    }
};

/**
 * Process payment and accept application
 * This endpoint:
 * 1. Creates a payment record (status: completed)
 * 2. Updates application status to Accepted
 * 3. Updates job status to In Progress
 * 4. Rejects all other pending applications
 */
export const processCheckout = async (req: Request, res: Response) => {
    const { application_id, job_id, payer_id, payee_id, amount } = req.body;

    if (!application_id || !job_id || !payer_id || !payee_id || !amount) {
        return sendError(res, 400, 'application_id, job_id, payer_id, payee_id, and amount are required.');
    }

    if (amount <= 0) {
        return sendError(res, 400, 'amount must be greater than 0.');
    }

    try {
        // Verify application exists and is pending
        const application = await jobAplRepo.findById(application_id);
        if (!application) {
            return sendError(res, 404, 'Application not found.');
        }
        if (application.status !== 'Pending') {
            return sendError(res, 400, 'Application has already been processed.');
        }

        // Verify job exists
        const job = await jobRepo.findById(job_id);
        if (!job) {
            return sendError(res, 404, 'Job not found.');
        }

        // Verify payer (employer) exists
        const payer = await userRepo.findById(payer_id);
        if (!payer) {
            return sendError(res, 400, 'Payer not found.');
        }

        // Verify payee (freelancer) exists
        const payee = await userRepo.findById(payee_id);
        if (!payee) {
            return sendError(res, 400, 'Payee not found.');
        }

        // 1. Create payment record
        const paymentId = await paymentsRepo.create(job_id, payer_id, payee_id, amount);
        if (!paymentId) {
            return sendError(res, 500, 'Failed to create payment.');
        }

        // 2. Update application status to Accepted
        await jobAplRepo.update(application_id, { status: 'Accepted' });

        // 3. Update job status to "In Progress"
        await jobRepo.update(job_id, { status: 'In Progress' });

        // 4. Reject all other pending applications for this job
        const allApplications = await jobAplRepo.findByJobId(job_id);
        for (const app of allApplications) {
            if (app.application_id !== application_id && app.status === 'Pending') {
                await jobAplRepo.update(app.application_id, { status: 'Rejected' });
            }
        }

        return sendSuccess(res, { 
            payment_id: paymentId, 
            message: 'Payment processed successfully. Job is now in progress.' 
        }, 201);

    } catch (error) {
        console.error('Checkout error:', error);
        rethrowHttpError(error, 500, 'An internal server error occurred during checkout.');
    }
};