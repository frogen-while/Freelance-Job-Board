export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Review {
  review_id: number;
  job_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: Rating;
  feedback?: string | null;
  created_at?: string;
  // Joined data
  reviewer_name?: string;
  job_title?: string;
}