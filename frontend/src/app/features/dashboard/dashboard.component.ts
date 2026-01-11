import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, PublicUser } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { Job } from '../../core/models';

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
  loading = true;

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
    this.api.getJobs().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.recentJobs = res.data.slice(0, 5);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
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
}
