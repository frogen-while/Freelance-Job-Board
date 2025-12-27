import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  error: string | null = null;
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

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
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.loading = false;
        this.error = 'Login failed.';
      }
    });
  }
}
