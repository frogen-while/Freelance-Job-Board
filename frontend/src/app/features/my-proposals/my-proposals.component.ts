import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { FormatService } from '../../core/format.service';
import { DateService } from '../../core/date.service';
import { Assignment, AssignmentDeliverable, JobApplication } from '../../core/models';

@Component({
  selector: 'app-my-proposals',
  templateUrl: './my-proposals.component.html',
  styleUrls: ['./my-proposals.component.scss']
})
export class MyProposalsComponent implements OnInit {
  proposals: JobApplication[] = [];
  filteredProposals: JobApplication[] = [];
  assignments: Assignment[] = [];
  activeAssignments: Assignment[] = [];
  completedAssignments: Assignment[] = [];
  deliverables: Record<number, AssignmentDeliverable[]> = {};
  deliverablesOpen: Record<number, boolean> = {};
  pendingSubmissions: Record<number, boolean> = {};
  uploadFiles: Record<number, File | null> = {};
  uploadLinks: Record<number, string> = {};
  uploading: Record<number, boolean> = {};
  uploadErrors: Record<number, string> = {};
  loading = true;
  assignmentsLoading = true;
  errorMessage = '';
  assignmentsError = '';
  activeTab: 'proposals' | 'current' = 'proposals';

  reviewModalOpen = false;
  reviewJobId: number | null = null;
  reviewJobTitle = '';
  revieweeId: number | null = null;
  revieweeName = '';
  reviewedJobs: Set<number> = new Set();

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    public fmt: FormatService,
    public date: DateService
  ) {}

  ngOnInit(): void {
    this.loadProposals();
    this.loadAssignments();
  }

  loadProposals(): void {
    const user = this.auth.getUser();
    if (!user) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.api.getApplicationsByFreelancerId(user.user_id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.proposals = res.data.filter(p => p.status === 'Pending');
          this.filteredProposals = this.proposals;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load proposals. Please try again.';
      }
    });
  }

  loadAssignments(): void {
    const user = this.auth.getUser();
    if (!user) {
      this.assignmentsLoading = false;
      return;
    }

    this.assignmentsLoading = true;
    this.assignmentsError = '';
    this.api.getAssignmentsByFreelancerId(user.user_id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.assignments = res.data;
          this.activeAssignments = this.assignments.filter(a => a.status === 'Active');
          this.completedAssignments = this.assignments.filter(a => a.status === 'Completed');

          this.completedAssignments.forEach(a => this.checkIfReviewed(a.job_id));
        } else {
          this.activeAssignments = [];
          this.completedAssignments = [];
        }
        this.assignmentsLoading = false;
      },
      error: () => {
        this.assignmentsLoading = false;
        this.assignmentsError = 'Failed to load current work.';
      }
    });
  }

  switchTab(tab: 'proposals' | 'current'): void {
    this.activeTab = tab;
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
          this.pendingSubmissions[assignmentId] = this.hasPendingSubmission(assignmentId);
        },
        error: () => {
          this.deliverables[assignmentId] = [];
          this.pendingSubmissions[assignmentId] = false;
        }
      });
    }
  }

  onFileSelected(assignmentId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    if (file && file.size > 50 * 1024 * 1024) {
      this.uploadFiles[assignmentId] = null;
      this.uploadErrors[assignmentId] = 'File is too large. максимум 50MB.';
      input.value = '';
      return;
    }
    this.uploadErrors[assignmentId] = '';
    this.uploadFiles[assignmentId] = file;
  }

  submitDeliverable(assignmentId: number): void {
    if (this.pendingSubmissions[assignmentId]) {
      return;
    }
    const file = this.uploadFiles[assignmentId] ?? null;
    const link = this.uploadLinks[assignmentId]?.trim() || null;
    if (this.uploadErrors[assignmentId]) {
      return;
    }
    if (!file && !link) {
      return;
    }

    this.uploading[assignmentId] = true;
    this.api.uploadAssignmentDeliverable(assignmentId, { file, link }).subscribe({
      next: (res) => {
        this.uploading[assignmentId] = false;
        if (res.success && res.data) {
          const current = this.deliverables[assignmentId] || [];
          this.deliverables[assignmentId] = [res.data, ...current];
          this.pendingSubmissions[assignmentId] = true;
          this.uploadFiles[assignmentId] = null;
          this.uploadLinks[assignmentId] = '';
          this.uploadErrors[assignmentId] = '';
        }
      },
      error: () => {
        this.uploading[assignmentId] = false;
      }
    });
  }

  hasPendingSubmission(assignmentId: number): boolean {
    const list = this.deliverables[assignmentId] || [];
    return list.some(d => (d.status || 'submitted') === 'submitted');
  }

  openReviewModal(assignment: Assignment): void {
    this.reviewJobId = assignment.job_id;
    this.reviewJobTitle = assignment.job_title || `Job #${assignment.job_id}`;

    this.api.getJobById(assignment.job_id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.revieweeId = res.data.employer_id;

          this.revieweeName = 'Employer';
          this.reviewModalOpen = true;
        }
      }
    });
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

  canReviewAssignment(assignment: Assignment): boolean {
    return assignment.status === 'Completed' && !this.reviewedJobs.has(assignment.job_id);
  }

  checkIfReviewed(jobId: number): void {
    const user = this.auth.getUser();
    if (!user) return;

    this.api.hasReviewedJob(jobId, user.user_id).subscribe({
      next: (res) => {
        if (res.success && res.data?.hasReviewed) {
          this.reviewedJobs.add(jobId);
        }
      }
    });
  }

  getReviewerId(): number | null {
    return this.auth.getUser()?.user_id || null;
  }
}
