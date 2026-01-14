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
  error: string | null = null;
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
    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success !== true) {
          this.error = ('error' in res && res.error?.message) ? res.error.message : 'Login failed.';
          return;
        }
        this.redirectAfterAuth();
      },
      error: () => {
        this.loading = false;
        this.error = 'Login failed.';
      }
    });
  }

  private redirectAfterAuth() {
    if (this.auth.needsOnboarding()) {
      this.router.navigate(['/onboarding']);
    } else if (this.returnUrl && this.returnUrl !== '/' && !this.returnUrl.includes('/login') && !this.returnUrl.includes('/register')) {
      this.router.navigateByUrl(this.returnUrl);
    } else if (this.auth.isFreelancer()) {
      this.router.navigate(['/find-work/browse']);
    } else {
      this.router.navigate(['/hire/browse']);
    }
  }
}
