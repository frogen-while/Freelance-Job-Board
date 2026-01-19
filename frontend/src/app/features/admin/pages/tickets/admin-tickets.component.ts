import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { AuthService, PublicUser } from '../../../../core/auth.service';
import { DateService } from '../../../../core/date.service';
import { SupportTicket, TicketReply, AdminUser } from '../../../../core/models';

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
  
  // Filters
  statusFilter = '';
  
  // Detail modal
  showDetailModal = false;
  selectedTicket: SupportTicket | null = null;
  ticketNotes: TicketReply[] = [];
  loadingNotes = false;
  newNote = '';
  
  // Message modal
  showMessageModal = false;
  messageTicket: SupportTicket | null = null;
  messageText = '';
  
  statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

  constructor(
    private api: ApiService,
    public auth: AuthService,
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
        console.error('Tickets API error:', err);
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
          this.showSuccess('Status updated');
        }
      },
      error: () => {
        this.showError('Failed to update status');
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
            user_name: 'Support'
          });
          this.newNote = '';
          this.showSuccess('Message sent');
        }
      },
      error: () => {
        this.showError('Failed to send message');
      }
    });
  }

  openMessageModal(ticket: SupportTicket): void {
    this.messageTicket = ticket;
    this.messageText = '';
    this.showMessageModal = true;
  }

  closeMessageModal(): void {
    this.showMessageModal = false;
    this.messageTicket = null;
    this.messageText = '';
  }

  sendMessage(): void {
    if (!this.messageTicket || !this.messageText.trim()) return;
    
    const user = this.auth.getUser();
    this.api.sendMessage({
      sender_id: user?.user_id || 0,
      receiver_id: this.messageTicket.user_id,
      body: this.messageText
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showSuccess('Message sent to user');
          this.closeMessageModal();
        }
      },
      error: () => {
        this.showError('Failed to send message');
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
