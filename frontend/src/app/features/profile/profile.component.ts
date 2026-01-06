import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  profile: any = null;
  loading = true;

  constructor(public auth: AuthService, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    const u = this.auth.getUser();
    if (!u) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.user = u;
    this.api.getProfileByUserId(u.user_id).subscribe({
      next: (res) => {
        if (res.success && res.data) this.profile = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.loading = false;
      }
    });
  }

  getInitials(): string {
    if (!this.user) return '';
    const fn = this.user.first_name ? this.user.first_name.charAt(0).toUpperCase() : '';
    const ln = this.user.last_name ? this.user.last_name.charAt(0).toUpperCase() : '';
    return (fn + ln).trim();
  }
}
