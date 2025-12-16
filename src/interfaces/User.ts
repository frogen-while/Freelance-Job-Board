export type MainRole = 'Administrator' | 'Management' | 'Regular' | 'Unregistered';

export interface User {
  user_id: number;
  name: string;
  email: string;
  password_hash: string;
  main_role: MainRole;
}