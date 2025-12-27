export type MainRole = 'Administrator' | 'Management' | 'Regular' | 'Unregistered';
export type UserStatus = 'active' | 'suspended' | 'archived';

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  main_role: MainRole;
  status?: UserStatus;
  created_at?: string;
  updated_at?: string;
}