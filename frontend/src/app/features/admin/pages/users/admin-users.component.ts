import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { AuthService } from '../../../../core/auth.service';
import { AdminUser, UserRole } from '../../../../core/models';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];
  selectedUsers: Set<number> = new Set();
  
  loading = true;
  errorMessage = '';
  successMessage = '';
  
  // Filters
  searchQuery = '';
  roleFilter = '';
  blockedFilter = '';
  
  // Available roles
  roles: UserRole[] = ['Admin', 'Manager', 'Support', 'Employer', 'Freelancer'];
  
  constructor(
    private api: ApiService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    
    const filters: any = {};
    if (this.roleFilter) filters.role = this.roleFilter;
    if (this.blockedFilter) filters.blocked = this.blockedFilter === 'true';
    if (this.searchQuery) filters.search = this.searchQuery;
    
    this.api.getAdminUsers(filters).subscribe({
      next: (res: any) => {
        if (res.success) {
          // Handle both formats: direct array or {data: array, pagination: {...}}
          this.users = Array.isArray(res.data) ? res.data : (res.data?.data || []);
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
        user.first_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesRole = !this.roleFilter || user.main_role === this.roleFilter;
      const matchesBlocked = !this.blockedFilter || 
        (this.blockedFilter === 'true' && user.is_blocked) ||
        (this.blockedFilter === 'false' && !user.is_blocked);
      
      return matchesSearch && matchesRole && matchesBlocked;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.loadUsers();
  }

  toggleUserSelection(userId: number): void {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }

  selectAll(): void {
    if (this.selectedUsers.size === this.filteredUsers.length) {
      this.selectedUsers.clear();
    } else {
      this.filteredUsers.forEach(u => this.selectedUsers.add(u.user_id));
    }
  }

  isSelected(userId: number): boolean {
    return this.selectedUsers.has(userId);
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

  bulkBlock(): void {
    const ids = Array.from(this.selectedUsers);
    if (ids.length === 0) return;
    
    this.api.bulkBlockUsers(ids).subscribe({
      next: (res) => {
        if (res.success) {
          this.users.filter(u => ids.includes(u.user_id)).forEach(u => u.is_blocked = true);
          this.selectedUsers.clear();
          this.showSuccess(`${res.data?.affected || ids.length} users blocked`);
        }
      },
      error: () => {
        this.showError('Failed to block users');
      }
    });
  }

  bulkUnblock(): void {
    const ids = Array.from(this.selectedUsers);
    if (ids.length === 0) return;
    
    this.api.bulkUnblockUsers(ids).subscribe({
      next: (res) => {
        if (res.success) {
          this.users.filter(u => ids.includes(u.user_id)).forEach(u => u.is_blocked = false);
          this.selectedUsers.clear();
          this.showSuccess(`${res.data?.affected || ids.length} users unblocked`);
        }
      },
      error: () => {
        this.showError('Failed to unblock users');
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

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
