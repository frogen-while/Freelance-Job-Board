
export type status = 'Pending'| 'Accepted' |'Rejected';

export interface jobApl {
  application_id: number
  job_id: number;
  freelancer_id: number;
  bid_amount: number;
  proposal_text: string;
  status: status; 
}