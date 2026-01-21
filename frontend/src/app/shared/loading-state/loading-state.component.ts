import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  template: `
    <div [class]="dark ? 'loading-state-dark' : 'loading-state'">
      <div class="spinner"></div>
      <span>{{ message }}</span>
    </div>
  `
})
export class LoadingStateComponent {
  @Input() message = 'Loading...';
  @Input() dark = true;
}
