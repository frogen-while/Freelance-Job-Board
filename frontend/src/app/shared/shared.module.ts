import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ProfileSidebarComponent } from './profile-sidebar/profile-sidebar.component';
import { ReviewModalComponent } from './review-modal/review-modal.component';
import { LoadingStateComponent } from './loading-state/loading-state.component';
import { EmptyStateComponent } from './empty-state/empty-state.component';
import { ErrorStateComponent } from './error-state/error-state.component';
import { AlertMessageComponent } from './alert-message/alert-message.component';

@NgModule({
  declarations: [
    ProfileSidebarComponent,
    ReviewModalComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    AlertMessageComponent
  ],
  exports: [
    ProfileSidebarComponent,
    ReviewModalComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    AlertMessageComponent,
    MatIconModule
  ]
})
export class SharedModule {}
