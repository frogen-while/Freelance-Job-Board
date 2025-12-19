
export type status = 'Open' | 'In Progress' | 'Closed';

export interface Supportticket {
  ticket_id: number
  user_id: number;
  support_id: number;
  subject: string;
  message: string;
  status: status
}