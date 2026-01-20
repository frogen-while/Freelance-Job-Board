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
  deliverables: Record<number, AssignmentDeliverable[]> = {};
  deliverablesOpen: Record<number, boolean> = {};
  uploadFiles: Record<number, File | null> = {};
  uploadLinks: Record<number, string> = {};
  uploading: Record<number, boolean> = {};
  uploadErrors: Record<number, string> = {};
  loading = true;
  assignmentsLoading = true;
  errorMessage = '';
  assignmentsError = '';
  statusFilter: string = 'all';
  activeTab: 'proposals' | 'current' = 'proposals';

  stats = {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  };

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
          this.proposals = res.data;
          this.filteredProposals = this.proposals;
          this.calculateStats();
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
        } else {
          this.activeAssignments = [];
        }
        this.assignmentsLoading = false;
      },
      error: () => {
        this.assignmentsLoading = false;
        this.assignmentsError = 'Failed to load current work.';
      }
    });
  }

  private calculateStats(): void {
    this.stats.total = this.proposals.length;
    this.stats.pending = this.proposals.filter(p => p.status === 'Pending').length;
    this.stats.accepted = this.proposals.filter(p => p.status === 'Accepted').length;
    this.stats.rejected = this.proposals.filter(p => p.status === 'Rejected').length;
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    if (status === 'all') {
      this.filteredProposals = this.proposals;
    } else {
      this.filteredProposals = this.proposals.filter(p => p.status === status);
    }
  }

  switchTab(tab: 'proposals' | 'current'): void {
    this.activeTab = tab;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
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

  trackByAssignmentId(_index: number, assignment: Assignment): number {
    return assignment.assignment_id;
  }

  trackByDeliverableId(_index: number, deliverable: AssignmentDeliverable): number {
    return deliverable.deliverable_id;
  }

}
