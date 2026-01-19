import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { AuthService } from '../../../core/auth.service';
import { FormatService } from '../../../core/format.service';
import { JobApplication, Job } from '../../../core/models';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styles: []
})
export class CheckoutComponent implements OnInit {
  applicationId: number | null = null;
  application: JobApplication | null = null;
  job: Job | null = null;
  freelancerName = '';
  
  loading = true;
  processing = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private auth: AuthService,
    public fmt: FormatService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('applicationId');
    if (id) {
      this.applicationId = parseInt(id, 10);
      this.loadData();
    } else {
      this.errorMessage = 'Invalid application ID';
      this.loading = false;
    }
  }

  loadData(): void {
    if (!this.applicationId) return;
    
    this.api.getApplicationById(this.applicationId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.application = res.data;
          this.freelancerName = this.application.display_name || 
            `${this.application.first_name || ''} ${this.application.last_name || ''}`.trim() ||
            'Freelancer';
          this.loadJob(this.application.job_id);
        } else {
          this.errorMessage = 'Application not found';
          this.loading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load application';
        this.loading = false;
      }
    });
  }

  loadJob(jobId: number): void {
    this.api.getJobById(jobId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.job = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load job details';
        this.loading = false;
      }
    });
  }

  get amount(): number {
    return this.application?.bid_amount || this.job?.budget || 0;
  }

  processPayment(): void {
    if (!this.application || !this.job || this.processing) return;
    
    this.processing = true;
    this.errorMessage = '';
    
    const user = this.auth.getUser();
    if (!user) {
      this.errorMessage = 'You must be logged in';
      this.processing = false;
      return;
    }

    // Create payment and accept application
    this.api.processPaymentAndAccept({
      application_id: this.applicationId!,
      job_id: this.job.job_id,
      payer_id: user.user_id,
      payee_id: this.application.freelancer_id,
      amount: this.amount
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/jobs', this.job!.job_id], {
            queryParams: { paymentSuccess: true }
          });
        } else {
          this.errorMessage = res.error?.message || 'Payment failed';
          this.processing = false;
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.error?.message || 'Payment processing failed';
        this.processing = false;
      }
    });
  }

  cancel(): void {
    if (this.job) {
      this.router.navigate(['/jobs', this.job.job_id]);
    } else {
      this.router.navigate(['/my-jobs']);
    }
  }
}
