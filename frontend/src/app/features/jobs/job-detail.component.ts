import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService, PublicUser } from '../../core/auth.service';
import { FormatService } from '../../core/format.service';
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
  applications: JobApplication[] = [];
  loadingApplications = false;

  loading = true;
  applying = false;
  applied = false;
  paymentSuccess = false;

  bidAmount: number | null = null;
  proposalText = '';

  isLoggedIn = false;
  isFreelancer = false;
  isOwner = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private auth: AuthService,
    public fmt: FormatService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.isFreelancer = this.auth.isFreelancer();
    this.currentUser = this.auth.getUser();

    this.route.queryParams.subscribe(params => {
      if (params['paymentSuccess'] === 'true') {
        this.paymentSuccess = true;
        setTimeout(() => this.paymentSuccess = false, 5000);
      }
    });

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
    if (typeof this.job.skills[0] === 'string') {
      this.jobSkillNames = this.job.skills as string[];
    } else {
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
          if (this.isOwner) {
            this.loadApplications(id);
          }
          if (this.currentUser && this.isFreelancer && !this.isOwner) {
            this.checkIfApplied(id);
          }
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  checkIfApplied(jobId: number) {
    if (!this.currentUser) return;
    this.api.getApplicationsByFreelancerId(this.currentUser.user_id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.applied = res.data.some((app: any) => app.job_id === jobId);
        }
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

    this.router.navigate(['/jobs/checkout', applicationId]);
  }

  rejectApplication(applicationId: number) {
    this.api.updateApplicationStatus(applicationId, 'Rejected').subscribe({
      next: (res) => {
        if (res.success) {
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
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/jobs/' + this.job?.job_id } });
      return;
    }

    if (!this.isFreelancer) {
      alert('Only freelancers can apply for jobs');
      return;
    }

    if (this.applied) {
      alert('You have already applied to this job');
      return;
    }

    if (this.job?.status !== 'Open') {
      alert('This job is no longer accepting applications');
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
        if (this.job && this.currentUser) {
          const messageBody = `New Proposal for "${this.job.title}"\n\nBid Amount: $${this.bidAmount}\n\n${this.proposalText.trim()}`;

          this.api.sendMessage({
            sender_id: this.currentUser.user_id,
            receiver_id: this.job.employer_id,
            job_id: this.job.job_id,
            body: messageBody
          }).subscribe({
            next: () => {
              this.applied = true;
              this.applying = false;
            },
            error: () => {
              this.applied = true;
              this.applying = false;
            }
          });
        } else {
          this.applied = true;
          this.applying = false;
        }
      },
      error: (err) => {
        this.applying = false;
        const msg = err?.error?.error?.message || 'Failed to submit application. Please try again.';
        alert(msg);
      }
    });
  }

  getEmployerName(): string {
    if (!this.employer) return 'Loading...';
    return `${this.employer.first_name} ${this.employer.last_name}`;
  }

  getEmployerInitials(): string {
    if (!this.employer) return '?';
    return (this.employer.first_name[0] + this.employer.last_name[0]).toUpperCase();
  }

  goBack() {
    this.router.navigate([this.isOwner ? '/my-jobs' : '/find-work/browse']);
  }
}