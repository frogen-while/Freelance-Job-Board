import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  isScrolled = false;

  constructor(public auth: AuthService, private router: Router) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled = currentScroll > 50;
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
