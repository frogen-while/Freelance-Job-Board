export type TicketStatus = 'Open' | 'In Progress' | 'Escalated' | 'Resolved' | 'Closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface SupportTicket {
  ticket_id: number;
  user_id: number;
  subject: string;
  message: string;
  priority?: TicketPriority;
  assigned_to?: number | null;
  status: TicketStatus;
  created_at?: string;
  updated_at?: string;
}