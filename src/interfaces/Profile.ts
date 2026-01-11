export type AvailabilityStatus = 'available' | 'partially_available' | 'not_available';
export type ProfileVisibility = 'public' | 'private' | 'clients_only';

export interface Profile {
  profile_id: number;
  user_id: number;
  display_name?: string | null;
  headline?: string | null;
  description?: string | null;
  photo_url?: string | null;
  location?: string | null;
  hourly_rate?: number | null;
  availability_status?: AvailabilityStatus;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
  skills?: number[] | null;
}

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ProfileSkill {
  user_id: number;
  skill_id: number;
  years_experience?: number | null;
  proficiency_level?: ProficiencyLevel | null;
}
