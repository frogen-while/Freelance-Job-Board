export type AssignmentStatus = 'Active' | 'Completed' | 'Terminated';

export interface Assignment {
  assignment_id: number;
  job_id?: number | null;
  contract_id?: number | null;
  freelancer_id: number;
  status: AssignmentStatus;
  created_at?: string;
  updated_at?: string;
}