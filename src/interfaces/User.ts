export type MainRole = 'Admin' | 'Manager' | 'Support' | 'Employer' | 'Freelancer';
export type UserStatus = 'active' | 'suspended' | 'archived';

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  main_role: MainRole;
  status?: UserStatus;
  is_blocked?: boolean;
  failed_attempts?: number;
  lock_until?: string | null;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}