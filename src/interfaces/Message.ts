export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  job_id?: number | null;
  body: string;
  is_read?: number;
  sent_at?: string;
}
