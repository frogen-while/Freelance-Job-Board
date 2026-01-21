import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-error-state',
  template: `
    <div [class]="dark ? 'error-state-dark' : 'error-state'">
      <div class="error-icon">⚠️</div>
      <p>{{ message }}</p>
      <button class="btn-dark-secondary" (click)="retry.emit()">{{ retryText }}</button>
    </div>
  `
})
export class ErrorStateComponent {
  @Input() message = 'Something went wrong';
  @Input() retryText = 'Try Again';
  @Input() dark = true;
  @Output() retry = new EventEmitter<void>();
}
