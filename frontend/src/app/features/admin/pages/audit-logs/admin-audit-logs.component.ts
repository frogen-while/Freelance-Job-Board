import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { DateService } from '../../../../core/date.service';
import { AuditLog } from '../../../../core/models';

@Component({
  selector: 'app-admin-audit-logs',
  templateUrl: './admin-audit-logs.component.html',
  styleUrls: ['./admin-audit-logs.component.scss']
})
export class AdminAuditLogsComponent implements OnInit {
  logs: AuditLog[] = [];
  loading = true;
  errorMessage = '';
  
  // Filters
  actionFilter = '';
  entityFilter = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 50;
  hasMore = true;
  
  actions = [
    'LOGIN', 'LOGOUT', 'ROLE_CHANGE', 'USER_BLOCKED', 'USER_UNBLOCKED',
    'JOB_CREATED', 'JOB_UPDATED', 'JOB_HIDDEN', 'JOB_RESTORED',
    'TICKET_CREATED', 'TICKET_ASSIGNED', 'TICKET_PRIORITY_CHANGED'
  ];
  
  entityTypes = ['USER', 'JOB', 'TICKET', 'APPLICATION', 'MESSAGE'];

  constructor(private api: ApiService, public dateService: DateService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(append = false): void {
    if (!append) {
      this.loading = true;
      this.currentPage = 1;
    }
    
    const filters: any = {
      limit: this.pageSize,
      offset: (this.currentPage - 1) * this.pageSize
    };
    
    if (this.actionFilter) filters.action = this.actionFilter;
    if (this.entityFilter) filters.entity_type = this.entityFilter;
    
    this.api.getAuditLogs(filters).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Backend returns { data: [...], pagination: {...} }
          const logsData = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
          if (append) {
            this.logs = [...this.logs, ...logsData];
          } else {
            this.logs = logsData;
          }
          this.hasMore = logsData.length === this.pageSize;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load audit logs';
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadLogs();
  }

  loadMore(): void {
    this.currentPage++;
    this.loadLogs(true);
  }

  clearFilters(): void {
    this.actionFilter = '';
    this.entityFilter = '';
    this.loadLogs();
  }

  getActionColor(action: string): string {
    if (action.includes('BLOCK')) return 'red';
    if (action.includes('UNBLOCK') || action.includes('RESTORED')) return 'green';
    if (action.includes('FLAG') || action.includes('HIDDEN')) return 'orange';
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'blue';
    return 'purple';
  }

  formatDetails(details: string | null): string {
    if (!details) return '';
    try {
      const parsed = JSON.parse(details);
      if (typeof parsed === 'object' && parsed !== null) {
        return Object.entries(parsed)
          .map(([key, val]) => `${key}: ${val}`)
          .join(', ');
      }
      return String(parsed);
    } catch {
      return details;
    }
  }
}
