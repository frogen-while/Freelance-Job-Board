export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

// ============ TYPES ============

export type ExperienceLevel = 'entry' | 'intermediate' | 'expert';
export type AvailabilityStatus = 'available' | 'partially_available' | 'not_available';
export type JobType = 'one_time' | 'ongoing' | 'contract';
export type DurationEstimate = 'less_than_week' | '1_to_4_weeks' | '1_to_3_months' | '3_to_6_months' | 'more_than_6_months';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501+';

// ============ JOB ============

export interface Job {
  job_id: number;
  employer_id: number;
  category_id: number;
  title: string;
  description: string;
  budget: number;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
  deadline: string;
  // New fields
  experience_level?: ExperienceLevel | null;
  job_type?: JobType;
  duration_estimate?: DurationEstimate | null;
  is_remote?: boolean;
  location?: string | null;
  skills?: string[];
  created_at?: string;
  updated_at?: string;
}

// ============ CATEGORY ============

export interface Category {
  category_id: number;
  name: string;
  description: string;
  manager_id: number | null;
}

// ============ PROFILES ============

// Base profile (shared by all users)
export interface Profile {
  profile_id: number;
  user_id: number;
  display_name: string | null;
  headline: string | null;
  description: string | null;
  photo_url: string | null;
  location: string | null;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Freelancer-specific profile data
export interface FreelancerProfileData {
  id?: number;
  user_id: number;
  title?: string | null;
  hourly_rate?: number | null;
  availability_status?: AvailabilityStatus | null;
  experience_level?: ExperienceLevel | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  jobs_completed?: number;
  rating?: number | null;
  reviews_count?: number;
}

// Freelancer profile (combined data from backend JOIN)
export interface FreelancerProfile {
  profile_id: number;
  user_id: number;
  // From profiles
  display_name: string | null;
  headline: string | null;
  description: string | null;
  photo_url: string | null;
  location: string | null;
  onboarding_completed?: boolean;
  // From freelancer_profiles
  title?: string | null;
  hourly_rate: number | null;
  availability_status: AvailabilityStatus | null;
  experience_level?: ExperienceLevel | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  jobs_completed?: number;
  rating?: number | null;
  reviews_count?: number;
  // From users
  first_name: string;
  last_name: string;
  // Skills
  skills: string[];
}

// Employer-specific profile data
export interface EmployerProfileData {
  id?: number;
  user_id: number;
  company_name?: string | null;
  company_description?: string | null;
  company_website?: string | null;
  company_size?: CompanySize | null;
  industry?: string | null;
  jobs_posted?: number;
  total_spent?: number;
  rating?: number | null;
  reviews_count?: number;
}

// Employer profile (combined data from backend JOIN)
export interface EmployerProfile {
  profile_id: number;
  user_id: number;
  // From profiles
  display_name: string | null;
  headline: string | null;
  description: string | null;
  photo_url: string | null;
  location: string | null;
  // From employer_profiles
  company_name?: string | null;
  company_description?: string | null;
  company_website?: string | null;
  company_size?: CompanySize | null;
  industry?: string | null;
  jobs_posted?: number;
  total_spent?: number;
  rating?: number | null;
  reviews_count?: number;
  // From users
  first_name: string;
  last_name: string;
}

// ============ RESPONSES ============

export interface FreelancersResponse {
  freelancers: FreelancerProfile[];
  total: number;
}

export interface EmployersResponse {
  employers: EmployerProfile[];
  total: number;
}

// ============ SKILL ============

export interface Skill {
  skill_id: number;
  name: string;
}

// ============ JOB FILTERS ============

export interface JobFilters {
  q?: string;
  category_id?: number;
  status?: string;
  experience_level?: ExperienceLevel;
  job_type?: JobType;
  is_remote?: boolean;
  budget_min?: number;
  budget_max?: number;
  skills?: number[];
}

// ============ CREATE JOB PAYLOAD ============

export interface CreateJobPayload {
  employer_id: number;
  category_id: number;
  title: string;
  description: string;
  budget: number;
  deadline?: string;
  experience_level?: ExperienceLevel;
  job_type?: JobType;
  duration_estimate?: DurationEstimate;
  is_remote?: boolean;
  location?: string;
  skill_ids?: number[];
}
