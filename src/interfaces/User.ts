export type MainRole = 'Administrator' | 'Management' | 'Regular' | 'Unregistered';
export type UserStatus = 'active' | 'suspended' | 'archived';
export type UserType = 'Employer' | 'Freelancer' | 'Reviewer' | 'Support';

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  main_role: MainRole;
  status?: UserStatus;
  user_types?: UserType[];
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}