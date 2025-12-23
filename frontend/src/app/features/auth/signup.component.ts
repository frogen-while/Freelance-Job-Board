import { Component } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-signup',
  template: `
    <div class="app-card">
      <h2>Sign up</h2>
      <form (submit)="signup($event)">
        <input name="name" placeholder="Name" [(ngModel)]="name" />
        <input name="email" placeholder="Email" [(ngModel)]="email" />
        <input name="password" type="password" placeholder="Password" [(ngModel)]="password" />
        <button type="submit">Sign up</button>
      </form>
    </div>
  `
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  constructor(private auth: AuthService) {}

  signup(e: Event) {
    e.preventDefault();
    this.auth.register(this.name, this.email, this.password).subscribe((res: any) => {
      const token = res.token || res.data?.token;
      if (token) this.auth.setToken(token);
    });
  }
}