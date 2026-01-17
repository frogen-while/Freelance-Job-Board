import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { AuthService } from '../../../../core/auth.service';
import { JobFlag, HiddenJob } from '../../../../core/models';

@Component({
  selector: 'app-admin-moderation',
  templateUrl: './admin-moderation.component.html',
  styleUrls: ['./admin-moderation.component.scss']
})
export class AdminModerationComponent implements OnInit {
  activeTab: 'flags' | 'hidden' = 'flags';
  
  pendingFlags: JobFlag[] = [];
  hiddenJobs: HiddenJob[] = [];
  
  loadingFlags = true;
  loadingHidden = true;
  errorMessage = '';
  successMessage = '';
  
  // Modal state
  showFlagModal = false;
  showHideModal = false;
  selectedJobId: number | null = null;
  flagReason = '';
  hideReason = '';

  constructor(
    private api: ApiService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPendingFlags();
    this.loadHiddenJobs();
  }

  setTab(tab: 'flags' | 'hidden'): void {
    this.activeTab = tab;
  }

  loadPendingFlags(): void {
    this.loadingFlags = true;
    this.api.getPendingFlags().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.pendingFlags = res.data;
        }
        this.loadingFlags = false;
      },
      error: () => {
        this.loadingFlags = false;
      }
    });
  }

  loadHiddenJobs(): void {
    this.loadingHidden = true;
    this.api.getHiddenJobs().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.hiddenJobs = res.data;
        }
        this.loadingHidden = false;
      },
      error: () => {
        this.loadingHidden = false;
      }
    });
  }

  reviewFlag(flag: JobFlag, status: 'reviewed' | 'dismissed'): void {
    this.api.reviewFlag(flag.id, status).subscribe({
      next: (res) => {
        if (res.success) {
          this.pendingFlags = this.pendingFlags.filter(f => f.id !== flag.id);
          this.showSuccess(`Flag ${status}`);
        }
      },
      error: () => {
        this.showError('Failed to update flag');
      }
    });
  }

  openHideModal(jobId: number): void {
    this.selectedJobId = jobId;
    this.hideReason = '';
    this.showHideModal = true;
  }

  closeHideModal(): void {
    this.showHideModal = false;
    this.selectedJobId = null;
    this.hideReason = '';
  }

  hideJob(): void {
    if (!this.selectedJobId || !this.hideReason.trim()) return;
    
    this.api.hideJob(this.selectedJobId, this.hideReason).subscribe({
      next: (res) => {
        if (res.success) {
          // Remove from pending flags if any
          this.pendingFlags = this.pendingFlags.filter(f => f.job_id !== this.selectedJobId);
          this.loadHiddenJobs();
          this.closeHideModal();
          this.showSuccess('Job hidden');
        }
      },
      error: () => {
        this.showError('Failed to hide job');
      }
    });
  }

  restoreJob(job: HiddenJob): void {
    this.api.restoreJob(job.job_id).subscribe({
      next: (res) => {
        if (res.success) {
          this.hiddenJobs = this.hiddenJobs.filter(j => j.job_id !== job.job_id);
          this.showSuccess('Job restored');
        }
      },
      error: () => {
        this.showError('Failed to restore job');
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

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
