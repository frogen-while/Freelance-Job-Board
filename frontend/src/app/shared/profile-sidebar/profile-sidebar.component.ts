import { Component, OnInit } from '@angular/core';
import { AuthService, PublicUser } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

interface ProfileData {
  headline?: string;
  photo_url?: string;
  location?: string;
  skills?: string[];
}

interface FreelancerStats {
  hourly_rate?: number | null;
  availability_status?: string;
  experience_level?: string | null;
  jobs_completed?: number;
  rating?: number | null;
  reviews_count?: number;
}

interface EmployerStats {
  company_name?: string;
  industry?: string;
  jobs_posted?: number;
  total_spent?: number;
  rating?: number | null;
  reviews_count?: number;
}

@Component({
  selector: 'app-profile-sidebar',
  templateUrl: './profile-sidebar.component.html',
  styleUrls: ['./profile-sidebar.component.scss']
})
export class ProfileSidebarComponent implements OnInit {
  user: PublicUser | null = null;
  profile: ProfileData | null = null;
  freelancerStats: FreelancerStats | null = null;
  employerStats: EmployerStats | null = null;
  isFreelancer = false;
  isEmployer = false;
  isLoggedIn = false;
  loading = true;

  constructor(
    private auth: AuthService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.user = this.auth.getUser();
    this.isFreelancer = this.auth.isFreelancer();
    this.isEmployer = !this.isFreelancer && this.isLoggedIn;

    if (this.user) {
      this.loadProfile();
      if (this.isFreelancer) {
        this.loadFreelancerStats();
      } else {
        this.loadEmployerStats();
      }
    } else {
      this.loading = false;
    }
  }

  private loadProfile(): void {
    if (!this.user) return;

    this.api.getProfileByUserId(this.user.user_id).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.profile = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadFreelancerStats(): void {
    if (!this.user) return;

    this.api.getFreelancerProfile(this.user.user_id).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.freelancerStats = {
            hourly_rate: res.data.hourly_rate,
            availability_status: res.data.availability_status || 'available',
            experience_level: res.data.experience_level,
            jobs_completed: res.data.jobs_completed || 0,
            rating: res.data.rating,
            reviews_count: res.data.reviews_count || 0
          };
        }
      }
    });
  }

  private loadEmployerStats(): void {
    if (!this.user) return;

    this.api.getEmployerProfile(this.user.user_id).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.employerStats = {
            company_name: res.data.company_name,
            industry: res.data.industry,
            jobs_posted: res.data.jobs_posted || 0,
            total_spent: res.data.total_spent || 0,
            rating: res.data.rating,
            reviews_count: res.data.reviews_count || 0
          };
        }
      }
    });
  }

  getInitials(): string {
    if (!this.user) return '?';
    return (this.user.first_name[0] + this.user.last_name[0]).toUpperCase();
  }

  getDisplayName(): string {
    if (this.user) return `${this.user.first_name} ${this.user.last_name}`;
    return 'User';
  }

  getAvailabilityLabel(): string {
    switch (this.freelancerStats?.availability_status) {
      case 'available': return 'Available';
      case 'partially_available': return 'Partially Available';
      case 'not_available': return 'Not Available';
      default: return 'Available';
    }
  }

  getAvailabilityClass(): string {
    return this.freelancerStats?.availability_status || 'available';
  }

  getExperienceLabel(): string {
    switch (this.freelancerStats?.experience_level) {
      case 'entry': return 'Entry Level';
      case 'intermediate': return 'Intermediate';
      case 'expert': return 'Expert';
      default: return '';
    }
  }

  formatRating(rating: number | null | undefined): string {
    if (!rating) return '-';
    return rating.toFixed(1);
  }
}
