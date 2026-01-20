import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { DateService } from '../../../../core/date.service';
import { AuthService } from '../../../../core/auth.service';
import { AdminUser, SupportTicket, UserRole } from '../../../../core/models';

@Component({
  selector: 'app-admin-tickets',
  templateUrl: './admin-tickets.component.html',
  styleUrls: ['./admin-tickets.component.scss']
})
export class AdminTicketsComponent implements OnInit {
  tickets: SupportTicket[] = [];
  filteredTickets: SupportTicket[] = [];
  managers: AdminUser[] = [];
  selectedManagerIds: Record<number, number | null> = {};
  
  loading = true;
  errorMessage = '';
  successMessage = '';
  
  statusFilter = '';
  showDetailModal = false;
  selectedTicket: SupportTicket | null = null;
  
  statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
  currentRole: UserRole | null = null;
  currentUserId: number | null = null;
  canChangeStatus = false;
  canAssignToManager = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    public dateService: DateService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    this.currentRole = user?.main_role ?? null;
    this.currentUserId = user?.user_id ?? null;
    this.canChangeStatus = this.currentRole === 'Admin' || this.currentRole === 'Manager';
    this.canAssignToManager = this.currentRole === 'Support';
    if (this.canAssignToManager) {
      this.loadManagers();
    }
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.errorMessage = '';
    
    const filters: any = {};
    if (this.statusFilter) filters.status = this.statusFilter;
    
    this.api.getFilteredTickets(filters).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const tickets = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
          this.tickets = tickets;
          this.filteredTickets = this.tickets;
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error?.message || 'Failed to load tickets';
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadTickets();
  }

  loadManagers(): void {
    this.api.getManagersForTickets().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.managers = res.data;
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load managers';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  updateStatus(ticket: SupportTicket, status: string): void {
    if (!this.canChangeStatus || !this.canChangeStatusFor(ticket)) {
      return;
    }
    this.api.updateSupportTicket(ticket.ticket_id, { status }).subscribe({
      next: (res) => {
        if (res.success) {
          ticket.status = status as any;
          this.successMessage = 'Status updated';
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: () => {
        this.errorMessage = 'Failed to update status';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  sendToManager(ticket: SupportTicket): void {
    const managerId = this.selectedManagerIds[ticket.ticket_id];
    if (!managerId) {
      this.errorMessage = 'Select a manager to send this ticket.';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.api.assignTicket(ticket.ticket_id, managerId).subscribe({
      next: (res) => {
        if (res.success) {
          ticket.assigned_to = managerId;
          this.successMessage = 'Ticket sent to manager.';
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.error?.message || 'Failed to send ticket.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  openDetailModal(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedTicket = null;
  }

  canChangeStatusFor(ticket: SupportTicket): boolean {
    if (this.currentRole === 'Admin') return true;
    if (this.currentRole === 'Manager') {
      return ticket.assigned_to === this.currentUserId;
    }
    return false;
  }
}
