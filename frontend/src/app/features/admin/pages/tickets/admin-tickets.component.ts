import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { AuthService, PublicUser } from '../../../../core/auth.service';
import { SupportTicket, TicketReply, AdminUser } from '../../../../core/models';

@Component({
  selector: 'app-admin-tickets',
  templateUrl: './admin-tickets.component.html',
  styleUrls: ['./admin-tickets.component.scss']
})
export class AdminTicketsComponent implements OnInit {
  tickets: SupportTicket[] = [];
  filteredTickets: SupportTicket[] = [];
  supportStaff: AdminUser[] = [];
  selectedTickets: Set<number> = new Set();
  
  loading = true;
  errorMessage = '';
  successMessage = '';
  
  // Filters
  statusFilter = '';
  priorityFilter = '';
  
  // Detail modal
  showDetailModal = false;
  selectedTicket: SupportTicket | null = null;
  ticketNotes: TicketReply[] = [];
  loadingNotes = false;
  newNote = '';
  
  statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
  priorities = ['low', 'medium', 'high', 'urgent'];

  constructor(
    private api: ApiService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
    this.loadSupportStaff();
  }

  loadTickets(): void {
    this.loading = true;
    this.errorMessage = '';
    
    const filters: any = {};
    if (this.statusFilter) filters.status = this.statusFilter;
    if (this.priorityFilter) filters.priority = this.priorityFilter;
    
    this.api.getFilteredTickets(filters).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Handle both direct array and paginated { data: [...] } formats
          const tickets = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
          this.tickets = tickets;
          this.filteredTickets = this.tickets;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Tickets API error:', err);
        this.errorMessage = err.error?.error?.message || 'Failed to load tickets';
        this.loading = false;
      }
    });
  }

  loadSupportStaff(): void {
    this.api.getAdminUsers({ role: 'Support' }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Handle both paginated { data: [...] } and direct array formats
          const users = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
          // Include Support, Manager, Admin
          this.supportStaff = users.filter((u: any) => 
            ['Support', 'Manager', 'Admin'].includes(u.main_role)
          );
        }
      }
    });
  }

  onFilterChange(): void {
    this.loadTickets();
  }

  toggleTicketSelection(ticketId: number): void {
    if (this.selectedTickets.has(ticketId)) {
      this.selectedTickets.delete(ticketId);
    } else {
      this.selectedTickets.add(ticketId);
    }
  }

  selectAll(): void {
    if (this.selectedTickets.size === this.filteredTickets.length) {
      this.selectedTickets.clear();
    } else {
      this.filteredTickets.forEach(t => this.selectedTickets.add(t.ticket_id));
    }
  }

  isSelected(ticketId: number): boolean {
    return this.selectedTickets.has(ticketId);
  }

  assignTicket(ticket: SupportTicket, userId: number): void {
    this.api.assignTicket(ticket.ticket_id, userId).subscribe({
      next: (res) => {
        if (res.success) {
          ticket.assigned_to = userId;
          const staff = this.supportStaff.find(s => s.user_id === userId);
          ticket.assigned_name = staff ? `${staff.first_name} ${staff.last_name}` : undefined;
          this.showSuccess('Ticket assigned');
        }
      },
      error: () => {
        this.showError('Failed to assign ticket');
      }
    });
  }

  updatePriority(ticket: SupportTicket, priority: string): void {
    this.api.updateTicketPriority(ticket.ticket_id, priority).subscribe({
      next: (res) => {
        if (res.success) {
          ticket.priority = priority as any;
          this.showSuccess('Priority updated');
        }
      },
      error: () => {
        this.showError('Failed to update priority');
      }
    });
  }

  updateStatus(ticket: SupportTicket, status: string): void {
    this.api.updateSupportTicket(ticket.ticket_id, { status }).subscribe({
      next: (res) => {
        if (res.success) {
          ticket.status = status as any;
          this.showSuccess('Status updated');
        }
      },
      error: () => {
        this.showError('Failed to update status');
      }
    });
  }

  bulkUpdateStatus(status: string): void {
    const ids = Array.from(this.selectedTickets);
    if (ids.length === 0) return;
    
    this.api.bulkUpdateTicketStatus(ids, status).subscribe({
      next: (res) => {
        if (res.success) {
          this.tickets.filter(t => ids.includes(t.ticket_id)).forEach(t => t.status = status as any);
          this.selectedTickets.clear();
          this.showSuccess(`${res.data?.affected || ids.length} tickets updated`);
        }
      },
      error: () => {
        this.showError('Failed to update tickets');
      }
    });
  }

  openDetailModal(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.showDetailModal = true;
    this.loadTicketNotes(ticket.ticket_id);
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedTicket = null;
    this.ticketNotes = [];
    this.newNote = '';
  }

  loadTicketNotes(ticketId: number): void {
    this.loadingNotes = true;
    this.api.getTicketNotes(ticketId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.ticketNotes = res.data;
        }
        this.loadingNotes = false;
      },
      error: () => {
        this.loadingNotes = false;
      }
    });
  }

  addNote(): void {
    if (!this.selectedTicket || !this.newNote.trim()) return;
    
    this.api.addTicketNote(this.selectedTicket.ticket_id, this.newNote, true).subscribe({
      next: (res) => {
        if (res.success) {
          const user = this.auth.getUser();
          this.ticketNotes.push({
            id: res.data?.id || 0,
            ticket_id: this.selectedTicket!.ticket_id,
            user_id: user?.user_id || 0,
            content: this.newNote,
            is_internal: true,
            created_at: new Date().toISOString(),
            user_name: user ? `${user.first_name} ${user.last_name}` : undefined
          });
          this.newNote = '';
          this.showSuccess('Note added');
        }
      },
      error: () => {
        this.showError('Failed to add note');
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPriorityColor(priority: string | undefined): string {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'green';
    }
  }
}
