export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export interface EmployerProfile {
  id: number;
  user_id: number;
  company_name?: string | null;
  company_description?: string | null;
  company_website?: string | null;
  company_size?: CompanySize | null;
  industry?: string | null;
  jobs_posted: number;
  total_spent: number;
  created_at?: string;
  updated_at?: string;
}

// Extended employer profile with user and base profile info
export interface EmployerProfileFull extends EmployerProfile {
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
}
