export interface Profile {
  user_id: number;
  description: string | null;
  photo_url: string | null;
  education_info: string | null;
  languages: string | null;
  completed_orders: string | null;
  timezone: string | null;
  hourly_rate: number | null;
}
