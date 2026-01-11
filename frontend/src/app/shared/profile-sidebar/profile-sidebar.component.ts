import { Component, OnInit } from '@angular/core';
import { AuthService, PublicUser } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

interface ProfileData {
  display_name?: string;
  headline?: string;
  photo_url?: string;
  hourly_rate?: number;
  availability_status?: string;
  location?: string;
  skills?: string[];
}

@Component({
  selector: 'app-profile-sidebar',
  templateUrl: './profile-sidebar.component.html',
  styleUrls: ['./profile-sidebar.component.scss']
})
export class ProfileSidebarComponent implements OnInit {
  user: PublicUser | null = null;
  profile: ProfileData | null = null;
  isFreelancer = false;
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

    if (this.user) {
      this.loadProfile();
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

  getInitials(): string {
    if (!this.user) return '?';
    return (this.user.first_name[0] + this.user.last_name[0]).toUpperCase();
  }

  getDisplayName(): string {
    if (this.profile?.display_name) return this.profile.display_name;
    if (this.user) return `${this.user.first_name} ${this.user.last_name}`;
    return 'User';
  }

  getAvailabilityLabel(): string {
    switch (this.profile?.availability_status) {
      case 'available': return 'Available';
      case 'partially_available': return 'Partially Available';
      case 'not_available': return 'Not Available';
      default: return 'Available';
    }
  }

  getAvailabilityClass(): string {
    return this.profile?.availability_status || 'available';
  }
}
