export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type status = PaymentStatus;

export interface Payment {
  payment_id: number;
  job_id: number;
  payer_id: number;
  payee_id: number;
  amount: number;
  status?: PaymentStatus;
  created_at?: string;
  completed_at?: string | null;
}