export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

// ============ TYPES ============

export type ExperienceLevel = 'entry' | 'intermediate' | 'expert';
export type JobType = 'fixed' | 'hourly';
export type DurationEstimate = 'less_than_week' | '1_2_weeks' | '2_4_weeks' | '1_3_months' | '3_6_months' | 'more_than_6_months';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501+';

// ============ JOB ============

export interface Job {
  job_id: number;
  employer_id: number;
  category_id: number;
  title: string;
  description: string;
  budget: number;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
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
  experience_level?: ExperienceLevel | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  jobs_completed?: number;
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
  experience_level?: ExperienceLevel | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  jobs_completed?: number;
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

// ============ JOB APPLICATION ============

export type JobApplicationStatus = 'Pending' | 'Accepted' | 'Rejected';

export interface JobApplication {
  application_id: number;
  job_id: number;
  freelancer_id: number;
  bid_amount: number;
  proposal_text?: string;
  status: JobApplicationStatus;
  created_at?: string;
  // Joined freelancer data
  first_name?: string;
  last_name?: string;
  email?: string;
  display_name?: string;
  headline?: string;
  photo_url?: string;
  hourly_rate?: number;
  experience_level?: ExperienceLevel;
  // Joined job data (for freelancer's view)
  job_title?: string;
  job_budget?: number;
  job_status?: string;
}

// ============ ASSIGNMENTS ============

export type AssignmentStatus = 'Active' | 'Completed' | 'Terminated';

export interface Assignment {
  assignment_id: number;
  job_id: number;
  freelancer_id: number;
  status: AssignmentStatus;
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

// ============ MESSAGE ============

export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  job_id?: number | null;
  body: string;
  is_read: boolean;
  sent_at: string;
  // Joined data
  sender_name?: string;
  receiver_name?: string;
  job_title?: string;
}

export interface Conversation {
  other_user_id: number;
  other_user_name: string;
  other_user_photo?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  job_id?: number;
  job_title?: string;
}

// ============ REVIEW ============

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Review {
  review_id: number;
  job_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: Rating;
  feedback?: string | null;
  created_at?: string;
  // Joined data
  reviewer_name?: string;
  job_title?: string;
}

// ============ ADMIN MODELS ============

export type UserRole = 'Admin' | 'Manager' | 'Support' | 'Employer' | 'Freelancer';

export interface AdminUser {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  main_role: UserRole;
  is_blocked: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OverviewStats {
  total_users: number;
  total_jobs: number;
  total_applications: number;
  open_tickets: number;
  new_users_this_week: number;
  new_users_this_month: number;
  active_jobs: number;
  completed_jobs: number;
}

export interface RevenueStats {
  total_revenue: number;
  revenue_this_month: number;
  revenue_this_week: number;
  average_job_value: number;
  top_categories: { category_id: number; category_name: string; total: number }[];
}

export interface UserStats {
  total_employers: number;
  total_freelancers: number;
  new_employers_this_month: number;
  new_freelancers_this_month: number;
  active_employers: number;
  active_freelancers: number;
  blocked_users: number;
}

export interface JobStats {
  total_jobs: number;
  open_jobs: number;
  assigned_jobs: number;
  completed_jobs: number;
  cancelled_jobs: number;
  jobs_this_month: number;
  average_budget: number;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
  // Joined
  user_email?: string;
  user_name?: string;
}

export interface SupportTicket {
  ticket_id: number;
  user_id: number;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: number | null;
  created_at?: string;
  updated_at?: string;
  // Joined
  user_email?: string;
  user_name?: string;
  assigned_name?: string;
}
