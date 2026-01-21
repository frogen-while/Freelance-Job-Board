export type JobApplicationStatus = 'Pending'| 'Accepted' |'Rejected' | 'Completed';

export interface JobApl {
  application_id: number;
  job_id: number;
  freelancer_id: number;
  bid_amount: number;
  proposal_text?: string;
  status: JobApplicationStatus;
  created_at?: string;
}

export type ProposalStatus = 'submitted' | 'viewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';

export interface Proposal {
  proposal_id: number;
  project_id: number;
  freelancer_id: number;
  cover_letter?: string | null;
  proposed_amount: number;
  proposed_hours?: number | null;
  proposed_timeline?: string | null;
  status?: ProposalStatus;
  submitted_at?: string;
  responded_at?: string | null;
}