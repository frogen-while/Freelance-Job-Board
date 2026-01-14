import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { JobApplication } from '../../core/models';

@Component({
  selector: 'app-my-proposals',
  templateUrl: './my-proposals.component.html',
  styleUrls: ['./my-proposals.component.scss']
})
export class MyProposalsComponent implements OnInit {
  proposals: JobApplication[] = [];
  filteredProposals: JobApplication[] = [];
  loading = true;
  errorMessage = '';
  statusFilter: string = 'all';

  stats = {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  };

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProposals();
  }

  loadProposals(): void {
    const user = this.auth.getUser();
    if (!user) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.api.getApplicationsByFreelancerId(user.user_id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.proposals = res.data;
          this.filteredProposals = this.proposals;
          this.calculateStats();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load proposals. Please try again.';
      }
    });
  }

  private calculateStats(): void {
    this.stats.total = this.proposals.length;
    this.stats.pending = this.proposals.filter(p => p.status === 'Pending').length;
    this.stats.accepted = this.proposals.filter(p => p.status === 'Accepted').length;
    this.stats.rejected = this.proposals.filter(p => p.status === 'Rejected').length;
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    if (status === 'all') {
      this.filteredProposals = this.proposals;
    } else {
      this.filteredProposals = this.proposals.filter(p => p.status === status);
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  viewJob(jobId: number): void {
    this.router.navigate(['/jobs', jobId]);
  }

  formatBudget(budget: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(budget);
  }

  getTimeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}
