import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ProfileSidebarComponent } from './profile-sidebar/profile-sidebar.component';
import { ReviewModalComponent } from './review-modal/review-modal.component';

@NgModule({
  declarations: [
    ProfileSidebarComponent,
    ReviewModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule
  ],
  exports: [
    ProfileSidebarComponent,
    ReviewModalComponent,
    MatIconModule
  ]
})
export class SharedModule {}
