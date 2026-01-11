import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ProfileSidebarComponent } from './profile-sidebar/profile-sidebar.component';

@NgModule({
  declarations: [ProfileSidebarComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [ProfileSidebarComponent]
})
export class SharedModule {}
