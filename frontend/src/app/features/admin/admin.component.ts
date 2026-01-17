import { Component } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  navItems = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard', minRole: 'support' },
    { label: 'Users', route: '/admin/users', icon: 'people', minRole: 'manager' },
    { label: 'Moderation', route: '/admin/moderation', icon: 'flag', minRole: 'support' },
    { label: 'Tickets', route: '/admin/tickets', icon: 'support_agent', minRole: 'support' },
    { label: 'Statistics', route: '/admin/statistics', icon: 'bar_chart', minRole: 'manager' },
    { label: 'Audit Logs', route: '/admin/audit-logs', icon: 'history', minRole: 'admin' }
  ];

  constructor(public auth: AuthService) {}

  canAccess(minRole: string): boolean {
    if (minRole === 'admin') return this.auth.isAdmin();
    if (minRole === 'manager') return this.auth.isManager();
    return this.auth.isSupport();
  }
}
