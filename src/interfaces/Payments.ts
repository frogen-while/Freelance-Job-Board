export type status = 'Pending' | 'Paid' | 'Failed';

export interface Payment {
  payment_id: number;
  job_id: number;
  payer_id: number;
  receiver_id: number;
  amount: number;
  status: status;
}