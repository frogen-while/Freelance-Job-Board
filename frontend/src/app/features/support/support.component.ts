import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { AuthService, PublicUser } from '../../core/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface SupportTicket {
  ticket_id: number;
  user_id: number;
  support_id?: number | null;
  subject: string;
  message: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit, OnDestroy {
  currentUser: PublicUser | null = null;
  faqs: FAQ[] = [];
  ticketSubject = '';
  ticketMessage = '';
  isSubmitting = false;
  submitSuccess = false;
  userTickets: SupportTicket[] = [];
  loadingTickets = false;
  isAdminRole = false;

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdminRole = this.authService.isAdminRole();
    this.initializeFAQ();
    this.authService.getUser$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (this.currentUser && !this.isAdminRole) {
          this.loadUserTickets();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFAQ(): void {
    this.faqs = [
      {
        question: 'How do I create an account?',
        answer: 'Click on the Register button in the header and fill out the form with your details. You can choose to be either an Employer or Freelancer.'
      },
      {
        question: 'How do I post a job or find work?',
        answer: 'Employers can post jobs from My Jobs page. Freelancers can browse available jobs from Find Work and submit proposals.'
      },
      {
        question: 'How long does it take to get paid?',
        answer: 'Payments are typically processed within 5-7 business days after project completion.'
      },
      {
        question: 'How is dispute resolution handled?',
        answer: 'Our support team mediates disputes between employers and freelancers. Contact us through this page for assistance.'
      },
      {
        question: 'How do I update my profile?',
        answer: 'Navigate to your Profile page and click Edit. You can update your information, skills, and portfolio at any time.'
      }
    ];
  }

  submitTicket(): void {
    if (!this.ticketSubject.trim() || !this.ticketMessage.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (!this.currentUser) {
      alert('Please log in to submit a support ticket');
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;

    this.apiService.createSupportTicket({
      user_id: this.currentUser.user_id,
      support_id: 1,
      subject: this.ticketSubject,
      message: this.ticketMessage,
      status: 'Open'
    }).subscribe(
      (response: any) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.resetForm();
        if (this.currentUser) {
          this.loadUserTickets();
        }
        setTimeout(() => {
          this.submitSuccess = false;
        }, 3000);
      },
      (error) => {
        this.isSubmitting = false;
        console.error('Error creating ticket:', error);
        alert('Failed to submit ticket. Please try again.');
      }
    );
  }

  private resetForm(): void {
    this.ticketSubject = '';
    this.ticketMessage = '';
  }

  private loadUserTickets(): void {
    if (!this.currentUser) return;

    this.loadingTickets = true;
    this.apiService.getMyTickets().subscribe(
      (response: any) => {
        this.loadingTickets = false;
        this.userTickets = response.data || response || [];
      },
      (error) => {
        this.loadingTickets = false;
        console.error('Error loading tickets:', error);
        this.userTickets = [];
      }
    );
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Open':
        return '#ff9800';
      case 'In Progress':
        return '#2196f3';
      case 'Resolved':
        return '#4caf50';
      case 'Closed':
        return '#757575';
      default:
        return '#999';
    }
  }
}
