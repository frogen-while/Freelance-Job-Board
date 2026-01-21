import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { validatePassword, type PasswordValidation } from '../../core/password-validator';

type RegisterRole = 'Employer' | 'Freelancer';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  first_name = '';
  last_name = '';
  email = '';
  password = '';
  main_role: RegisterRole | null = null;

  error: string | null = null;
  passwordValidation: PasswordValidation | null = null;
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = null;

    if (!this.main_role) {
      this.error = 'Please choose an account type.';
      return;
    }

    this.loading = true;

    this.auth
      .register({
        first_name: this.first_name,
        last_name: this.last_name,
        email: this.email,
        password: this.password,
        main_role: this.main_role
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success !== true) {
            this.error = ('error' in res && res.error?.message) ? res.error.message : 'Registration failed.';
            return;
          }

          this.router.navigate(['/onboarding']);
        },
        error: (err) => {
          this.loading = false;
          const apiError = err?.error?.error;
          this.error = apiError?.message || 'Registration failed.';
        }
      });
  }

  onPasswordChange() {
    this.passwordValidation = this.password.length > 0 ? validatePassword(this.password) : null;
  }
}
