export interface Payment {
  payment_id: number;
  job_id: number;
  payer_id: number;
  payee_id: number;
  amount: number;
  created_at?: string;
}