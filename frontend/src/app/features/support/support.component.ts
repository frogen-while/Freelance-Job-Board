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
  
  // FAQ Section
  faqs: FAQ[] = [];
  
  // Form Section
  ticketSubject = '';
  ticketMessage = '';
  isSubmitting = false;
  submitSuccess = false;
  
  // Tickets History
  userTickets: SupportTicket[] = [];
  loadingTickets = false;

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeFAQ();
    
    // Get current user
    this.authService.getUser$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (this.currentUser) {
          this.loadUserTickets();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFAQ(): void {
    const allFAQs: FAQ[] = [
      {
        question: 'How do I create an account?',
        answer: 'Click on the Register button in the header and fill out the form with your details. You can choose to be either an Employer or Freelancer.'
      },
      {
        question: 'What payment methods are accepted?',
        answer: 'We accept various payment methods including credit cards, debit cards, and bank transfers. Payment processing is handled securely through our payment gateway.'
      },
      {
        question: 'How long does it take to get paid?',
        answer: 'Payments are typically processed within 5-7 business days after project completion. The exact timeframe depends on your payment method.'
      },
      {
        question: 'Can I cancel a job posting?',
        answer: 'Yes, you can cancel a job posting at any time before an agreement is reached with a freelancer. Once you hire someone, the job becomes locked.'
      },
      {
        question: 'How is dispute resolution handled?',
        answer: 'Our support team mediates disputes between employers and freelancers. We encourage communication first, and if needed, we can arbitrate based on evidence provided by both parties.'
      },
      {
        question: 'What is your refund policy?',
        answer: 'Refunds are available within 30 days of purchase if you are not satisfied with the service. Please contact support for refund requests.'
      },
      {
        question: 'How do I update my profile?',
        answer: 'Navigate to your Profile page and click Edit. You can update your information, skills, and portfolio at any time.'
      },
      {
        question: 'How are freelancers rated?',
        answer: 'Freelancers are rated by employers after project completion. Ratings are based on quality of work, communication, and timeliness.'
      }
    ];

    // Select 5 random FAQs
    this.faqs = this.getRandomItems(allFAQs, 5);
  }

  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
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

    // Create support ticket
    this.apiService.createSupportTicket({
      user_id: this.currentUser.user_id,
      support_id: 1, // Default support agent, can be changed later
      subject: this.ticketSubject,
      message: this.ticketMessage,
      status: 'Open'
    }).subscribe(
      (response: any) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.resetForm();
        
        // Reload tickets
        if (this.currentUser) {
          this.loadUserTickets();
        }

        // Clear success message after 3 seconds
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
    this.apiService.getUserSupportTickets(this.currentUser.user_id).subscribe(
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
