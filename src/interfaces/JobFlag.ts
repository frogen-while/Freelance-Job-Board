export type FlagStatus = 'pending' | 'reviewed' | 'dismissed';

export interface JobFlag {
  flag_id: number;
  job_id: number;
  flagged_by: number;
  reason: string;
  status: FlagStatus;
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: number | null;
}

export interface JobFlagWithDetails extends JobFlag {
  job_title?: string;
  flagged_by_name?: string;
  reviewed_by_name?: string;
}
