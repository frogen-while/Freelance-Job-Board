import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ProfileSidebarComponent } from './profile-sidebar/profile-sidebar.component';
import { AuthPromptModalComponent } from './auth-prompt-modal/auth-prompt-modal.component';

@NgModule({
  declarations: [
    ProfileSidebarComponent,
    AuthPromptModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    ProfileSidebarComponent,
    AuthPromptModalComponent
  ]
})
export class SharedModule {}
