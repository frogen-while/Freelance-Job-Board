import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent {
  constructor(private router: Router, private auth: AuthService) {}

  get isMessagesPage(): boolean {
    return this.router.url.startsWith('/messages');
  }

  get showSupportButton(): boolean {
    return !this.isMessagesPage && !this.auth.isAdminRole();
  }

  openSupport() {
    this.router.navigate(['/support']);
  }
}