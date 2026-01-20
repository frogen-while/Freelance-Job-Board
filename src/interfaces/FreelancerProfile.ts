export type ExperienceLevel = 'entry' | 'intermediate' | 'expert';

export interface FreelancerProfile {
  id: number;
  user_id: number;
  title?: string | null;
  hourly_rate?: number | null;
  experience_level?: ExperienceLevel | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  jobs_completed: number;
  created_at?: string;
  updated_at?: string;
}

// Extended freelancer profile with user and base profile info
export interface FreelancerProfileFull extends FreelancerProfile {
  // From users table
  first_name: string;
  last_name: string;
  email: string;
  // From profiles table
  display_name?: string | null;
  headline?: string | null;
  description?: string | null;
  photo_url?: string | null;
  location?: string | null;
  // Skills
  skills: string[];
}
