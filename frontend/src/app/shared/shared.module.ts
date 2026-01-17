import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { ProfileSidebarComponent } from './profile-sidebar/profile-sidebar.component';

@NgModule({
  declarations: [
    ProfileSidebarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  exports: [
    ProfileSidebarComponent,
    MatIconModule
  ]
})
export class SharedModule {}
