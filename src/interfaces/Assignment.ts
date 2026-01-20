export type AssignmentStatus = 'Active' | 'Completed' | 'Terminated';

export interface Assignment {
  assignment_id: number;
  job_id?: number | null;
  contract_id?: number | null;
  freelancer_id: number;
  status?: AssignmentStatus;
  created_at?: string;
  updated_at?: string;
  job_title?: string | null;
  job_budget?: number | null;
  job_status?: string | null;
  freelancer_first_name?: string | null;
  freelancer_last_name?: string | null;
}

export interface AssignmentDeliverable {
  deliverable_id: number;
  assignment_id: number;
  freelancer_id: number;
  file_path?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  link_url?: string | null;
  status?: 'submitted' | 'accepted' | 'changes_requested';
  reviewer_message?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
}