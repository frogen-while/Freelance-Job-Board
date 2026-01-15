import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { ProfileSidebarComponent } from './profile-sidebar/profile-sidebar.component';
import { AuthPromptModalComponent } from './auth-prompt-modal/auth-prompt-modal.component';

@NgModule({
  declarations: [
    ProfileSidebarComponent,
    AuthPromptModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  exports: [
    ProfileSidebarComponent,
    AuthPromptModalComponent,
    MatIconModule
  ]
})
export class SharedModule {}
