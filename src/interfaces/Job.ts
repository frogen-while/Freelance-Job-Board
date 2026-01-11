export type JobStatus = 'Open' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
export type JobType = 'fixed' | 'hourly';
export type ExperienceLevel = 'entry' | 'intermediate' | 'expert';
export type DurationEstimate = 'less_than_week' | '1_2_weeks' | '2_4_weeks' | '1_3_months' | '3_6_months' | 'more_than_6_months';

export interface Job {
  job_id: number;
  employer_id: number;
  category_id: number;
  title: string;
  description: string;
  budget: number;
  status: JobStatus; 
  deadline: string;
  experience_level?: ExperienceLevel | null;
  job_type?: JobType;
  duration_estimate?: DurationEstimate | null;
  is_remote?: boolean;
  location?: string | null;
  created_at?: string;
  updated_at?: string;
  // Relations (populated on demand)
  skills?: string[];
}

export type ProjectStatus = 'draft' | 'open' | 'in_review' | 'awarded' | 'completed' | 'cancelled';
export type BudgetType = 'fixed' | 'hourly';

export interface Project {
  project_id: number;
  client_id: number;
  category_id: number;
  title: string;
  description: string;
  budget_type?: BudgetType;
  budget_min?: number | null;
  budget_max?: number | null;
  currency?: string;
  status?: ProjectStatus;
  location_requirement?: string | null;
  remote_allowed?: boolean;
  deadline?: string | null;
  created_at?: string;
  open_at?: string | null;
  closed_at?: string | null;
  updated_at?: string;
}

export type SkillImportance = 'required' | 'preferred' | 'nice_to_have';

export interface ProjectSkill {
  project_id: number;
  skill_id: number;
  importance?: SkillImportance;
}