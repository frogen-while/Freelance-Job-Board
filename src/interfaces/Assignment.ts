
export type status = 'Active' | 'Completed' | 'Terminated';

export interface Assignment {
  assignment_id: number
  job_id: number;
  freelancer_id: number;
  status: status
}