import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { Category } from '../core/models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  activeDropdown: string | null = null;
  private closeTimeout: any = null;
  private unreadInterval: any = null;

  categories: Category[] = [];
  unreadCount = 0;

  constructor(
    public auth: AuthService,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.checkUnreadMessages();
    // Check unread messages every 30 seconds
    this.unreadInterval = setInterval(() => this.checkUnreadMessages(), 30000);
  }

  ngOnDestroy() {
    if (this.unreadInterval) {
      clearInterval(this.unreadInterval);
    }
  }

  checkUnreadMessages() {
    const user = this.auth.getUser();
    if (user) {
      this.api.getUnreadCount(user.user_id).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.unreadCount = res.data.unread_count || 0;
          }
        }
      });
    }
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories = res.data;
        }
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.categories = [];
      }
    });
  }

  openDropdown(menu: string) {
    this.cancelClose();
    this.activeDropdown = menu;
  }

  scheduleClose() {
    this.closeTimeout = setTimeout(() => {
      this.activeDropdown = null;
    }, 150);
  }

  cancelClose() {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  }

  closeDropdown() {
    this.cancelClose();
    this.activeDropdown = null;
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }

  getInitials(user: any): string {
    if (!user) return '';
    const fn = user.first_name ? user.first_name.charAt(0).toUpperCase() : '';
    const ln = user.last_name ? user.last_name.charAt(0).toUpperCase() : '';
    return (fn + ln).trim();
  }
}