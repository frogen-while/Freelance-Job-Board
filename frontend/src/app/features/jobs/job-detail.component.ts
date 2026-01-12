import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService, PublicUser } from '../../core/auth.service';
import { Job, Category, Skill, JobApplication } from '../../core/models';

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
  skills: Skill[] = [];
  jobSkillNames: string[] = [];
  
  // Job applications (for employer view)
  applications: JobApplication[] = [];
  loadingApplications = false;
  
  loading = true;
  applying = false;
  applied = false;
  
  bidAmount: number | null = null;
  proposalText = '';
  
  isLoggedIn = false;
  isFreelancer = false;
  isOwner = false;
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
    
    this.loadSkills();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadJob(id);
  }

  loadSkills() {
    this.api.getSkills().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.skills = res.data;
          this.mapJobSkills();
        }
      }
    });
  }

  mapJobSkills() {
    if (!this.job?.skills || !this.job.skills.length) return;
    
    // If skills are already strings (skill names), use them directly
    // If they are IDs, map them to names
    if (typeof this.job.skills[0] === 'string') {
      this.jobSkillNames = this.job.skills as string[];
    } else {
      // Skills are IDs - map to names
      this.jobSkillNames = (this.job.skills as unknown as number[])
        .map(skillId => {
          const skill = this.skills.find(s => s.skill_id === skillId);
          return skill?.name || '';
        })
        .filter(name => name);
    }
  }

  loadJob(id: number) {
    this.loading = true;
    this.api.getJobById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.job = res.data;
          this.isOwner = this.currentUser?.user_id === this.job.employer_id;
          this.loadEmployer(this.job.employer_id);
          this.loadCategory(this.job.category_id);
          this.mapJobSkills();
          
          // Load applications if owner
          if (this.isOwner) {
            this.loadApplications(id);
          }
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

  loadApplications(jobId: number) {
    this.loadingApplications = true;
    this.api.getApplicationsByJobId(jobId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.applications = res.data;
        }
        this.loadingApplications = false;
      },
      error: () => {
        this.loadingApplications = false;
      }
    });
  }

  acceptApplication(applicationId: number) {
    this.api.updateApplicationStatus(applicationId, 'Accepted').subscribe({
      next: (res) => {
        if (res.success) {
          // Update local state
          const app = this.applications.find(a => a.application_id === applicationId);
          if (app) app.status = 'Accepted';
        }
      },
      error: () => {
        alert('Failed to accept application. Please try again.');
      }
    });
  }

  rejectApplication(applicationId: number) {
    this.api.updateApplicationStatus(applicationId, 'Rejected').subscribe({
      next: (res) => {
        if (res.success) {
          // Update local state
          const app = this.applications.find(a => a.application_id === applicationId);
          if (app) app.status = 'Rejected';
        }
      },
      error: () => {
        alert('Failed to reject application. Please try again.');
      }
    });
  }

  getApplicantName(app: JobApplication): string {
    if (app.display_name) return app.display_name;
    if (app.first_name && app.last_name) return `${app.first_name} ${app.last_name}`;
    return 'Unknown';
  }

  getApplicantInitials(app: JobApplication): string {
    if (app.first_name && app.last_name) {
      return (app.first_name[0] + app.last_name[0]).toUpperCase();
    }
    return '?';
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

  getExperienceLevelLabel(): string {
    if (!this.job?.experience_level) return '';
    const labels: Record<string, string> = {
      'entry': 'Entry Level',
      'intermediate': 'Intermediate',
      'expert': 'Expert'
    };
    return labels[this.job.experience_level] || '';
  }

  getJobTypeLabel(): string {
    if (!this.job?.job_type) return '';
    const labels: Record<string, string> = {
      'one_time': 'One-time project',
      'ongoing': 'Ongoing project',
      'contract': 'Contract'
    };
    return labels[this.job.job_type] || '';
  }

  getDurationLabel(): string {
    if (!this.job?.duration_estimate) return '';
    const labels: Record<string, string> = {
      'less_than_week': 'Less than a week',
      '1_to_4_weeks': '1 to 4 weeks',
      '1_to_3_months': '1 to 3 months',
      '3_to_6_months': '3 to 6 months',
      'more_than_6_months': 'More than 6 months'
    };
    return labels[this.job.duration_estimate] || '';
  }

  goBack() {
    this.router.navigate(['/find-work/browse']);
  }
}