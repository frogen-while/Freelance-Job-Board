import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  showPassword = false;
  error: string | null = null;
  attemptsLeft: number | null = null;
  retryInMinutes: number | null = null;
  loading = false;
  private returnUrl: string = '/';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  submit() {
    this.error = null;
    this.attemptsLeft = null;
    this.retryInMinutes = null;
    this.loading = true;

    type AttemptDetails = { attempts_left?: number; retry_in_minutes?: number };

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success !== true) {
          this.error = ('error' in res && res.error?.message) ? res.error.message : 'Login failed.';
          const details = ('error' in res && res.error?.details) ? res.error.details as AttemptDetails : undefined;
          this.attemptsLeft = typeof details?.attempts_left === 'number' ? details.attempts_left : null;
          this.retryInMinutes = typeof details?.retry_in_minutes === 'number' ? details.retry_in_minutes : null;
          return;
        }
        this.redirectAfterAuth();
      },
      error: (err) => {
        this.loading = false;
        const apiError = err?.error?.error;
        this.error = apiError?.message || 'Login failed.';
        const details = apiError?.details as AttemptDetails | undefined;
        this.attemptsLeft = typeof details?.attempts_left === 'number' ? details.attempts_left : null;
        this.retryInMinutes = typeof details?.retry_in_minutes === 'number' ? details.retry_in_minutes : null;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private redirectAfterAuth() {
    if (this.auth.isAdminRole()) {
      this.router.navigate(['/admin']);
      return;
    }
    
    if (this.auth.needsOnboarding()) {
      this.router.navigate(['/onboarding']);
    } else if (this.returnUrl && this.returnUrl !== '/' && !this.returnUrl.includes('/login') && !this.returnUrl.includes('/register')) {
      this.router.navigateByUrl(this.returnUrl);
    } else if (this.auth.isFreelancer()) {
      this.router.navigate(['/find-work/browse']);
    } else {
      this.router.navigate(['/my-jobs']);
    }
  }
}
