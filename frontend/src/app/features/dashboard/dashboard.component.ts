import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, PublicUser } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { Job, Review, JobApplication } from '../../core/models';

interface DashboardStats {
  label: string;
  value: number | string;
  icon: string;
  color: string;
}

interface QuickAction {
  label: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user: PublicUser | null = null;
  isFreelancer = false;
  isEmployer = false;
  
  stats: DashboardStats[] = [];
  quickActions: QuickAction[] = [];
  recentJobs: Job[] = [];
  recentReviews: Review[] = [];
  recentApplications: (JobApplication & { job_title?: string })[] = [];
  loading = true;
  loadingStats = true;
  loadingReviews = true;
  loadingApplications = true;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();
    this.isFreelancer = this.auth.isFreelancer();
    this.isEmployer = this.auth.isEmployer();
    
    this.setupDashboard();
    this.loadData();
    
    if (this.isFreelancer) {
      this.loadRecentReviews();
    }
    if (this.isEmployer) {
      this.loadRecentApplications();
    }
  }

  private setupDashboard(): void {
    if (this.isFreelancer) {
      this.stats = [
        { label: 'Active Proposals', value: 0, icon: 'proposals', color: 'blue' },
        { label: 'Jobs Applied', value: 0, icon: 'jobs', color: 'green' },
        { label: 'Earnings', value: '$0', icon: 'earnings', color: 'purple' },
        { label: 'Profile Views', value: 0, icon: 'views', color: 'orange' }
      ];
      
      this.quickActions = [
        { 
          label: 'Find Work', 
          description: 'Browse available jobs', 
          icon: 'search', 
          route: '/find-work/browse',
          color: 'blue'
        },
        { 
          label: 'My Proposals', 
          description: 'View your applications', 
          icon: 'proposals', 
          route: '/my-proposals',
          color: 'green'
        },
        { 
          label: 'Edit Profile', 
          description: 'Update your skills', 
          icon: 'profile', 
          route: '/profile',
          color: 'purple'
        }
      ];
    } else if (this.isEmployer) {
      this.stats = [
        { label: 'Active Jobs', value: 0, icon: 'jobs', color: 'blue' },
        { label: 'Total Proposals', value: 0, icon: 'proposals', color: 'green' },
        { label: 'Hired Freelancers', value: 0, icon: 'hired', color: 'purple' },
        { label: 'Total Spent', value: '$0', icon: 'spent', color: 'orange' }
      ];
      
      this.quickActions = [
        { 
          label: 'Post a Job', 
          description: 'Create a new project', 
          icon: 'add', 
          route: '/my-jobs',
          color: 'blue'
        },
        { 
          label: 'My Jobs', 
          description: 'Manage your projects', 
          icon: 'jobs', 
          route: '/my-jobs',
          color: 'green'
        },
        { 
          label: 'Find Talent', 
          description: 'Browse freelancers', 
          icon: 'search', 
          route: '/hire/browse',
          color: 'purple'
        }
      ];
    }
  }

  private loadData(): void {
    if (!this.user) {
      this.loading = false;
      this.loadingStats = false;
      return;
    }

    this.errorMessage = '';

    if (this.isFreelancer) {
      // Load freelancer stats
      this.api.getApplicationsByFreelancerId(this.user.user_id).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const apps = res.data;
            const pending = apps.filter((a: any) => a.status === 'Pending').length;
            const total = apps.length;
            const accepted = apps.filter((a: any) => a.status === 'Accepted').length;
            
            this.stats[0].value = pending;
            this.stats[1].value = total;
            this.stats[2].value = `$${accepted * 500}`; // Placeholder earnings
          }
          this.loadingStats = false;
          this.loading = false;
        },
        error: () => {
          this.loadingStats = false;
          this.loading = false;
          this.errorMessage = 'Failed to load dashboard data.';
        }
      });
    } else if (this.isEmployer) {
      // Load employer jobs and proposals
      this.api.getJobsByEmployerId(this.user.user_id).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const jobs = res.data;
            const activeJobs = jobs.filter((j: any) => j.status === 'Open').length;
            const assigned = jobs.filter((j: any) => j.status === 'Assigned').length;
            
            this.stats[0].value = activeJobs;
            this.stats[2].value = assigned;
            this.recentJobs = jobs.slice(0, 5);
            
            // Count total proposals
            let totalProposals = 0;
            let processedJobs = 0;
            if (jobs.length === 0) {
              this.loadingStats = false;
            }
            jobs.forEach((job: any) => {
              this.api.getApplicationsByJobId(job.job_id).subscribe({
                next: (appRes) => {
                  processedJobs++;
                  if (appRes.success && appRes.data) {
                    totalProposals += appRes.data.length;
                    this.stats[1].value = totalProposals;
                  }
                  if (processedJobs === jobs.length) {
                    this.loadingStats = false;
                  }
                },
                error: () => {
                  processedJobs++;
                  if (processedJobs === jobs.length) {
                    this.loadingStats = false;
                  }
                }
              });
            });
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.loadingStats = false;
          this.errorMessage = 'Failed to load dashboard data.';
        }
      });
      return;
    }

    this.api.getJobs().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.recentJobs = res.data.slice(0, 5);
        }
        this.loading = false;
        this.loadingStats = false;
      },
      error: () => {
        this.loading = false;
        this.loadingStats = false;
        this.errorMessage = 'Failed to load dashboard data.';
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getUserName(): string {
    if (!this.user) return '';
    return this.user.first_name || 'there';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  private loadRecentReviews(): void {
    if (!this.user) {
      this.loadingReviews = false;
      return;
    }

    this.api.getReviewsByUser(this.user.user_id).subscribe({
      next: (res: any) => {
        if (res.success && res.data?.reviews) {
          this.recentReviews = res.data.reviews.slice(0, 3);
        }
        this.loadingReviews = false;
      },
      error: () => {
        this.loadingReviews = false;
      }
    });
  }

  private loadRecentApplications(): void {
    if (!this.user) {
      this.loadingApplications = false;
      return;
    }

    // Get all employer's jobs, then get applications for each
    this.api.getJobsByEmployerId(this.user.user_id).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          const allApplications: (JobApplication & { job_title?: string })[] = [];
          let processed = 0;
          const jobs = res.data;

          jobs.forEach((job: Job) => {
            this.api.getApplicationsByJobId(job.job_id).subscribe({
              next: (appRes) => {
                processed++;
                if (appRes.success && appRes.data) {
                  const pendingApps = appRes.data
                    .filter((a: any) => a.status === 'Pending')
                    .map((a: any) => ({ ...a, job_title: job.title }));
                  allApplications.push(...pendingApps);
                }
                if (processed === jobs.length) {
                  // Sort by date and take first 5
                  this.recentApplications = allApplications
                    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
                    .slice(0, 5);
                  this.loadingApplications = false;
                }
              },
              error: () => {
                processed++;
                if (processed === jobs.length) {
                  this.loadingApplications = false;
                }
              }
            });
          });
        } else {
          this.loadingApplications = false;
        }
      },
      error: () => {
        this.loadingApplications = false;
      }
    });
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getApplicantName(app: JobApplication): string {
    if (app.display_name) return app.display_name;
    if (app.first_name || app.last_name) return `${app.first_name || ''} ${app.last_name || ''}`.trim();
    return 'Unknown';
  }
}
