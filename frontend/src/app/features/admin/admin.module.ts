import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './pages/users/admin-users.component';
import { AdminModerationComponent } from './pages/moderation/admin-moderation.component';
import { AdminTicketsComponent } from './pages/tickets/admin-tickets.component';
import { AdminAuditLogsComponent } from './pages/audit-logs/admin-audit-logs.component';
import { AdminStatisticsComponent } from './pages/statistics/admin-statistics.component';

import { AdminGuard, ManagerGuard, SupportGuard, AdminRoleGuard } from '../../core/guards';

const routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' as const },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent, canActivate: [ManagerGuard] },
      { path: 'moderation', component: AdminModerationComponent },
      { path: 'tickets', component: AdminTicketsComponent },
      { path: 'statistics', component: AdminStatisticsComponent, canActivate: [ManagerGuard] },
      { path: 'audit-logs', component: AdminAuditLogsComponent, canActivate: [AdminGuard] }
    ]
  }
];

@NgModule({
  declarations: [
    AdminComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminModerationComponent,
    AdminTicketsComponent,
    AdminAuditLogsComponent,
    AdminStatisticsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule {}
