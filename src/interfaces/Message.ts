export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  body: string;
  is_read?: number;
  sent_at?: string;
  sender_name?: string;
  receiver_name?: string;
}
