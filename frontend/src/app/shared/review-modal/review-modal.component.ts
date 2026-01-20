import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-review-modal',
  templateUrl: './review-modal.component.html',
  styleUrls: ['./review-modal.component.scss']
})
export class ReviewModalComponent {
  @Input() isOpen = false;
  @Input() jobId: number | null = null;
  @Input() jobTitle: string = '';
  @Input() reviewerId: number | null = null;
  @Input() revieweeId: number | null = null;
  @Input() revieweeName: string = '';
  
  @Output() closed = new EventEmitter<void>();
  @Output() reviewSubmitted = new EventEmitter<void>();

  rating: number = 0;
  hoverRating: number = 0;
  feedback: string = '';
  submitting = false;
  error = '';
  success = false;

  constructor(private api: ApiService) {}

  close(): void {
    if (!this.submitting) {
      this.reset();
      this.closed.emit();
    }
  }

  setRating(star: number): void {
    this.rating = star;
  }

  setHoverRating(star: number): void {
    this.hoverRating = star;
  }

  clearHoverRating(): void {
    this.hoverRating = 0;
  }

  getStarClass(star: number): string {
    const activeRating = this.hoverRating || this.rating;
    return star <= activeRating ? 'star active' : 'star';
  }

  submitReview(): void {
    if (!this.jobId || !this.reviewerId || !this.revieweeId) {
      this.error = 'Missing required information.';
      return;
    }

    if (this.rating < 1 || this.rating > 5) {
      this.error = 'Please select a rating from 1 to 5 stars.';
      return;
    }

    this.submitting = true;
    this.error = '';

    this.api.createReview({
      job_id: this.jobId,
      reviewer_id: this.reviewerId,
      reviewee_id: this.revieweeId,
      rating: this.rating,
      feedback: this.feedback.trim() || undefined
    }).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.success) {
          this.success = true;
          setTimeout(() => {
            this.reviewSubmitted.emit();
            this.close();
          }, 1500);
        } else {
          this.error = 'Failed to submit review. Please try again.';
        }
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message || 'Failed to submit review. Please try again.';
      }
    });
  }

  private reset(): void {
    this.rating = 0;
    this.hoverRating = 0;
    this.feedback = '';
    this.error = '';
    this.success = false;
    this.submitting = false;
  }
}
