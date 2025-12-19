
export type rating = 1| 2 | 3 | 4 | 5;

export interface JobReview {
  review_id: number
  job_id: number;
  reviewer_id: number;
  rating: number;
  feedback: string;
}