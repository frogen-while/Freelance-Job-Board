import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { JobFlag, SupportTicket } from '../../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats: { label: string; value: number | string; icon: string; color: string }[] = [];
  pendingFlags: JobFlag[] = [];
  openTickets: SupportTicket[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getOverviewStats().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const d = res.data;
          this.stats = [
            { label: 'Total Users', value: d.total_users, icon: 'people', color: 'blue' },
            { label: 'Total Jobs', value: d.total_jobs, icon: 'work', color: 'green' },
            { label: 'Applications', value: d.total_applications, icon: 'description', color: 'purple' },
            { label: 'Open Tickets', value: d.open_tickets, icon: 'support_agent', color: 'orange' }
          ];
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
    this.api.getPendingFlags().subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.pendingFlags = res.data.slice(0, 5);
        }
      },
      error: () => {}
    });
    this.api.getFilteredTickets({ status: 'Open' }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Handle both direct array and paginated { data: [...] } formats
          const tickets = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
          this.openTickets = tickets.slice(0, 5);
        }
      },
      error: () => {}
    });
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
