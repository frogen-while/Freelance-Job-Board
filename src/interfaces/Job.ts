
export type status = 'Open' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Job {
  job_id: number;
  employer_id: number;
  category_id: number;
  title: string;
  description: string;
  budget: number;
  status: status; 
  deadline: string;  
}