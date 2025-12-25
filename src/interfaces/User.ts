export type MainRole = 'Administrator' | 'Management' | 'Regular' | 'Unregistered';

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  main_role: MainRole;
}