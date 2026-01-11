import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService, PublicUser } from '../../core/auth.service';
import { Job, Category } from '../../core/models';

interface EmployerInfo {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  employer: EmployerInfo | null = null;
  category: Category | null = null;
  currentUser: PublicUser | null = null;
  
  loading = true;
  applying = false;
  applied = false;
  
  bidAmount: number | null = null;
  proposalText = '';
  
  isLoggedIn = false;
  isFreelancer = false;
  showAuthModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.isFreelancer = this.auth.isFreelancer();
    this.currentUser = this.auth.getUser();
    
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadJob(id);
  }

  loadJob(id: number) {
    this.loading = true;
    this.api.getJobById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.job = res.data;
          this.loadEmployer(this.job.employer_id);
          this.loadCategory(this.job.category_id);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadEmployer(employerId: number) {
    this.api.getUserById(employerId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.employer = res.data;
        }
      }
    });
  }

  loadCategory(categoryId: number) {
    this.api.getCategoryById(categoryId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.category = res.data;
        }
      }
    });
  }

  apply() {
    if (!this.isLoggedIn) {
      this.showAuthModal = true;
      return;
    }
    
    if (!this.isFreelancer) {
      alert('Only freelancers can apply for jobs');
      return;
    }
    
    if (!this.job || !this.currentUser) return;
    if (!this.bidAmount || !this.proposalText.trim()) {
      alert('Please fill in bid amount and proposal');
      return;
    }

    this.applying = true;
    const payload = {
      job_id: this.job.job_id,
      freelancer_id: this.currentUser.user_id,
      bid_amount: this.bidAmount,
      proposal_text: this.proposalText.trim(),
      status: 'Pending'
    };
    
    this.api.applyToJob(payload).subscribe({
      next: () => {
        this.applied = true;
        this.applying = false;
      },
      error: () => {
        this.applying = false;
        alert('Failed to submit application. Please try again.');
      }
    });
  }

  closeAuthModal() {
    this.showAuthModal = false;
  }

  getEmployerName(): string {
    if (!this.employer) return 'Loading...';
    return `${this.employer.first_name} ${this.employer.last_name}`;
  }

  getEmployerInitials(): string {
    if (!this.employer) return '?';
    return (this.employer.first_name[0] + this.employer.last_name[0]).toUpperCase();
  }

  formatBudget(budget: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(budget);
  }

  getStatusClass(): string {
    if (!this.job) return '';
    return this.job.status.toLowerCase().replace(' ', '-');
  }

  goBack() {
    this.router.navigate(['/find-work/browse']);
  }
}