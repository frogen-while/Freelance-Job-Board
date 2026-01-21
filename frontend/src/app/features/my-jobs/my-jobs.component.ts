import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { FormatService } from '../../core/format.service';
import { Assignment, AssignmentDeliverable, Job } from '../../core/models';

@Component({
  selector: 'app-my-jobs',
  templateUrl: './my-jobs.component.html',
  styleUrls: ['./my-jobs.component.scss']
})
export class MyJobsComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  loading = true;
  errorMessage = '';
  activeTab: 'submissions' | 'jobs' = 'submissions';

  assignments: Assignment[] = [];
  completedAssignments: Assignment[] = [];
  assignmentsLoading = true;
  assignmentsError = '';
  deliverables: Record<number, AssignmentDeliverable[]> = {};
  deliverablesOpen: Record<number, boolean> = {};
  reviewMessage: Record<number, string> = {};
  reviewing: Record<number, boolean> = {};

  reviewModalOpen = false;
  reviewJobId: number | null = null;
  reviewJobTitle = '';
  revieweeId: number | null = null;
  revieweeName = '';
  reviewedJobs: Set<number> = new Set();
  freelancerReviewedJobs: Set<number> = new Set();

  stats = {
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0
  };

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    public fmt: FormatService
  ) {}

  ngOnInit(): void {
    this.loadJobs();
    this.loadAssignments();
  }

  loadJobs(): void {
    const user = this.auth.getUser();
    if (!user) {
      this.loading = false;
      return;
    }

    this.errorMessage = '';
    this.api.getJobs().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.jobs = res.data.filter(job => job.employer_id === user.user_id);
          this.applyJobFilters();
          this.calculateStats();

          this.jobs.filter(j => j.status === 'Completed').forEach(job => {
            this.checkIfReviewed(job.job_id);
          });
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load jobs. Please try again.';
      }
    });
  }

  loadAssignments(): void {
    const user = this.auth.getUser();
    if (!user) {
      this.assignmentsLoading = false;
      return;
    }

    this.assignmentsError = '';
    this.assignmentsLoading = true;
    this.api.getAssignmentsByEmployerId(user.user_id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.assignments = res.data.filter(a => a.status === 'Active');
          this.completedAssignments = res.data.filter(a => a.status === 'Completed');
          this.completedAssignments.forEach(a => this.checkMutualReviews(a));
        } else {
          this.assignments = [];
          this.completedAssignments = [];
        }
        this.assignmentsLoading = false;
      },
      error: () => {
        this.assignmentsLoading = false;
        this.assignmentsError = 'Failed to load submissions.';
      }
    });
  }

  private calculateStats(): void {
    const visibleJobs = this.getVisibleJobs();
    this.stats.total = visibleJobs.length;
    this.stats.open = visibleJobs.filter(j => j.status === 'Open').length;
    this.stats.inProgress = visibleJobs.filter(j => j.status === 'In Progress').length;
    this.stats.completed = visibleJobs.filter(j => j.status === 'Completed').length;
  }

  switchTab(tab: 'submissions' | 'jobs'): void {
    this.activeTab = tab;
  }

  private getVisibleJobs(): Job[] {
    return this.jobs.filter(j => !this.isJobArchived(j.job_id));
  }

  private applyJobFilters(): void {
    const base = this.getVisibleJobs();

    this.filteredJobs = base.filter(j => j.status === 'Open');
  }

  viewJob(jobId: number): void {
    this.router.navigate(['/jobs', jobId]);
  }

  toggleDeliverables(assignmentId: number): void {
    this.deliverablesOpen[assignmentId] = !this.deliverablesOpen[assignmentId];
    if (this.deliverablesOpen[assignmentId] && !this.deliverables[assignmentId]) {
      this.api.getAssignmentDeliverables(assignmentId).subscribe({
        next: (res) => {
          this.deliverables[assignmentId] = res.success && res.data ? res.data : [];
        },
        error: () => {
          this.deliverables[assignmentId] = [];
        }
      });
    }
  }

  reviewDeliverable(deliverableId: number, status: 'accepted' | 'changes_requested'): void {
    const message = this.reviewMessage[deliverableId]?.trim() || null;
    this.reviewing[deliverableId] = true;
    this.api.reviewAssignmentDeliverable(deliverableId, status, message).subscribe({
      next: (res) => {
        this.reviewing[deliverableId] = false;
        const updatedStatus = res.data?.status || status;
        for (const assignmentId of Object.keys(this.deliverables)) {
          const list = this.deliverables[Number(assignmentId)];
          const item = list?.find(d => d.deliverable_id === deliverableId);
          if (item) {
            item.status = updatedStatus as 'accepted' | 'changes_requested';
            item.reviewer_message = res.data?.reviewer_message ?? message;
          }
        }
        if (updatedStatus === 'accepted') {
          this.loadAssignments();
          this.loadJobs();
        }
      },
      error: () => {
        this.reviewing[deliverableId] = false;
      }
    });
  }

  getFreelancerName(assignment: Assignment): string {
    const first = assignment.freelancer_first_name || '';
    const last = assignment.freelancer_last_name || '';
    return `${first} ${last}`.trim() || `Freelancer #${assignment.freelancer_id}`;
  }

  openReviewModal(job: Job, freelancerId: number, freelancerName: string): void {
    this.reviewJobId = job.job_id;
    this.reviewJobTitle = job.title;
    this.revieweeId = freelancerId;
    this.revieweeName = freelancerName;
    this.reviewModalOpen = true;
  }

  closeReviewModal(): void {
    this.reviewModalOpen = false;
    this.reviewJobId = null;
    this.reviewJobTitle = '';
    this.revieweeId = null;
    this.revieweeName = '';
  }

  onReviewSubmitted(): void {
    if (this.reviewJobId) {
      this.reviewedJobs.add(this.reviewJobId);
    }
    this.closeReviewModal();
  }

  canReviewJob(job: Job): boolean {
    return job.status === 'Completed' && !this.reviewedJobs.has(job.job_id);
  }

  getCompletedAssignmentForJob(jobId: number): Assignment | undefined {
    return this.completedAssignments.find(a => a.job_id === jobId);
  }

  checkIfReviewed(jobId: number): void {
    const user = this.auth.getUser();
    if (!user) return;

    this.api.hasReviewedJob(jobId, user.user_id).subscribe({
      next: (res) => {
        if (res.success && res.data?.hasReviewed) {
          this.reviewedJobs.add(jobId);
          this.applyJobFilters();
          this.calculateStats();
        }
      }
    });
  }

  private checkMutualReviews(assignment: Assignment): void {
    const user = this.auth.getUser();
    if (!user) return;

    const employerId = user.user_id;
    const freelancerId = assignment.freelancer_id;
    const jobId = assignment.job_id;

    this.api.hasReviewedJob(jobId, employerId).subscribe({
      next: (res) => {
        if (res.success && res.data?.hasReviewed) {
          this.reviewedJobs.add(jobId);
          this.applyCompletedAssignmentsFilter();
        }
      }
    });

    this.api.hasReviewedJob(jobId, freelancerId).subscribe({
      next: (res) => {
        if (res.success && res.data?.hasReviewed) {
          this.freelancerReviewedJobs.add(jobId);
          this.applyCompletedAssignmentsFilter();
        }
      }
    });
  }

  private applyCompletedAssignmentsFilter(): void {
    this.completedAssignments = this.completedAssignments.filter(a => !this.isJobArchived(a.job_id));
    this.applyJobFilters();
    this.calculateStats();
  }

  private isJobArchived(jobId: number): boolean {
    return this.reviewedJobs.has(jobId) && this.freelancerReviewedJobs.has(jobId);
  }

  getReviewerId(): number | null {
    return this.auth.getUser()?.user_id || null;
  }
}
