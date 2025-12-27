export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

export interface Job {
  job_id: number;
  employer_id: number;
  category_id: number;
  title: string;
  description: string;
  budget: number;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
  deadline: string;
}

export interface Category {
  category_id: number;
  name: string;
  description: string;
  manager_id: number | null;
}
