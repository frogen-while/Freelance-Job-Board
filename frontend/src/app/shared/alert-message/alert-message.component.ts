import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert-message',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div *ngIf="message" [class]="'alert-message alert-' + type">
      <mat-icon>{{ icon }}</mat-icon>
      <span>{{ message }}</span>
    </div>
  `,
  styles: [`
    .alert-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    .alert-success {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .alert-error {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .alert-warning {
      background: rgba(251, 191, 36, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }
    .alert-info {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    mat-icon { font-size: 1.25rem; width: 1.25rem; height: 1.25rem; }
  `]
})
export class AlertMessageComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';

  get icon(): string {
    const icons: Record<string, string> = {
      success: 'check_circle',
      error: 'error_outline',
      warning: 'warning',
      info: 'info'
    };
    return icons[this.type] || 'info';
  }
}
