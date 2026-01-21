import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { AuthService } from '../../../../core/auth.service';
import { DateService } from '../../../../core/date.service';
import { AdminUser, UserRole } from '../../../../core/models';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];

  loading = true;
  errorMessage = '';
  successMessage = '';

  searchQuery = '';
  roleFilter = '';

  roles: UserRole[] = ['Admin', 'Manager', 'Support', 'Employer', 'Freelancer'];

  constructor(
    private api: ApiService,
    public auth: AuthService,
    public dateService: DateService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    const filters: any = {};
    if (this.roleFilter) filters.role = this.roleFilter;
    if (this.searchQuery) filters.search = this.searchQuery;

    this.api.getAdminUsers(filters).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.users = res.data || [];
          this.applyFilters();
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchQuery ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesRole = !this.roleFilter || user.main_role === this.roleFilter;

      return matchesSearch && matchesRole;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.loadUsers();
  }

  canEditUser(user: AdminUser): boolean {

    if (this.auth.isAdmin()) {
      return user.main_role !== 'Admin';
    }

    if (this.auth.isManager()) {
      return !['Admin', 'Manager'].includes(user.main_role);
    }
    return false;
  }

  getAvailableRoles(): UserRole[] {
    if (this.auth.isAdmin()) {
      return this.roles;
    }
    if (this.auth.isManager()) {

      return ['Support', 'Employer', 'Freelancer'];
    }
    return [];
  }

  assignRole(user: AdminUser, role: UserRole): void {
    this.api.assignUserRole(user.user_id, role).subscribe({
      next: (res) => {
        if (res.success) {
          user.main_role = role;
          this.showSuccess(`Role updated to ${role}`);
        }
      },
      error: () => {
        this.showError('Failed to assign role');
      }
    });
  }

  blockUser(user: AdminUser): void {
    this.api.blockUser(user.user_id).subscribe({
      next: (res) => {
        if (res.success) {
          user.is_blocked = true;
          this.showSuccess('User blocked');
        }
      },
      error: () => {
        this.showError('Failed to block user');
      }
    });
  }

  unblockUser(user: AdminUser): void {
    this.api.unblockUser(user.user_id).subscribe({
      next: (res) => {
        if (res.success) {
          user.is_blocked = false;
          this.showSuccess('User unblocked');
        }
      },
      error: () => {
        this.showError('Failed to unblock user');
      }
    });
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 3000);
  }

}
