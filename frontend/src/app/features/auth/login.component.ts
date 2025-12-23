import { Component } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="app-card">
      <h2>Login</h2>
      <form (submit)="login($event)">
        <input name="email" placeholder="Email" [(ngModel)]="email" required />
        <input name="password" type="password" placeholder="Password" [(ngModel)]="password" required />
        <button type="submit">Log in</button>
      </form>
      <p>Don't have an account? <a routerLink="/login/signup">Sign up</a></p>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  constructor(private auth: AuthService) {}

  login(e: Event) {
    e.preventDefault();
    this.auth.login(this.email, this.password).subscribe((res: any) => {
      const token = res.token || res.data?.token;
      if (token) this.auth.setToken(token);
    });
  }
}