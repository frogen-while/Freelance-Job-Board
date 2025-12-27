export type AvailabilityStatus = 'available' | 'partially_available' | 'not_available';
export type ProfileVisibility = 'public' | 'private' | 'clients_only';

export interface Profile {
  profile_id: number;
  user_id: number;
  display_name?: string | null;
  headline?: string | null;
  description?: string | null;
  photo_url?: string | null;
  education_info?: string | null;
  languages?: string | null;
  location?: string | null;
  timezone?: string | null;
  hourly_rate_min?: number | null;
  hourly_rate_max?: number | null;
  currency?: string;
  availability_status?: AvailabilityStatus;
  profile_visibility?: ProfileVisibility;
  created_at?: string;
  updated_at?: string;
}

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ProfileSkill {
  user_id: number;
  skill_id: number;
  years_experience?: number | null;
  proficiency_level?: ProficiencyLevel | null;
}
