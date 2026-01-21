import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  navItems = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard', minRole: 'support' },
    { label: 'Users', route: '/admin/users', icon: 'people', minRole: 'manager' },
    { label: 'Tickets', route: '/admin/tickets', icon: 'support_agent', minRole: 'support' },
    { label: 'Audit Logs', route: '/admin/audit-logs', icon: 'history', minRole: 'admin' }
  ];

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {

    if (this.isSupportOnly()) {
      this.router.navigate(['/admin/tickets']);
    }
  }

  canAccess(minRole: string): boolean {
    if (minRole === 'admin') return this.auth.isAdmin();
    if (minRole === 'manager') return this.auth.isManager();
    return this.auth.isSupport();
  }

  isSupportOnly(): boolean {

    return this.auth.isSupport() && !this.auth.isManager() && !this.auth.isAdmin();
  }
}
