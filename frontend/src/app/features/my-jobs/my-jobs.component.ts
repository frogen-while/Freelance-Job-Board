import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { Job } from '../../core/models';

@Component({
  selector: 'app-my-jobs',
  templateUrl: './my-jobs.component.html',
  styleUrls: ['./my-jobs.component.scss']
})
export class MyJobsComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  loading = true;
  errorMessage = '';
  statusFilter: string = 'all';

  stats = {
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0
  };

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  private loadJobs(): void {
    const user = this.auth.getUser();
    if (!user) {
      this.loading = false;
      return;
    }

    this.errorMessage = '';
    this.api.getJobs().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.jobs = res.data.filter(job => job.employer_id === user.user_id);
          this.filteredJobs = this.jobs;
          this.calculateStats();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load jobs. Please try again.';
      }
    });
  }

  private calculateStats(): void {
    this.stats.total = this.jobs.length;
    this.stats.open = this.jobs.filter(j => j.status === 'Open').length;
    this.stats.inProgress = this.jobs.filter(j => j.status === 'In Progress' || j.status === 'Assigned').length;
    this.stats.completed = this.jobs.filter(j => j.status === 'Completed').length;
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    if (status === 'all') {
      this.filteredJobs = this.jobs;
    } else if (status === 'active') {
      this.filteredJobs = this.jobs.filter(j => j.status === 'Open' || j.status === 'In Progress' || j.status === 'Assigned');
    } else {
      this.filteredJobs = this.jobs.filter(j => j.status === status);
    }
  }

  viewJob(jobId: number): void {
    this.router.navigate(['/jobs', jobId]);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }
}
