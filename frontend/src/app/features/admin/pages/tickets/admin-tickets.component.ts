import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { DateService } from '../../../../core/date.service';
import { SupportTicket } from '../../../../core/models';

@Component({
  selector: 'app-admin-tickets',
  templateUrl: './admin-tickets.component.html',
  styleUrls: ['./admin-tickets.component.scss']
})
export class AdminTicketsComponent implements OnInit {
  tickets: SupportTicket[] = [];
  filteredTickets: SupportTicket[] = [];
  
  loading = true;
  errorMessage = '';
  successMessage = '';
  
  statusFilter = '';
  showDetailModal = false;
  selectedTicket: SupportTicket | null = null;
  
  statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

  constructor(
    private api: ApiService,
    public dateService: DateService
  ) {}

  ngOnInit(): void {
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

  updateStatus(ticket: SupportTicket, status: string): void {
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

  openDetailModal(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedTicket = null;
  }
}
