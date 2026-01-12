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

export interface FreelancerProfile {
  profile_id: number;
  user_id: number;
  display_name: string | null;
  headline: string | null;
  description: string | null;
  photo_url: string | null;
  location: string | null;
  hourly_rate: number | null;
  availability_status: string | null;
  onboarding_completed?: boolean;
  first_name: string;
  last_name: string;
  skills: string[];
}

export interface FreelancersResponse {
  freelancers: FreelancerProfile[];
  total: number;
}

export interface Skill {
  skill_id: number;
  name: string;
}
