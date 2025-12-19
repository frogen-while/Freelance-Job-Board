export interface Auditlog {
  log_id: number;
  user_id: number;
  action: string;
  entity: string;
  entity_id: number;
  timestamp: Date;
}