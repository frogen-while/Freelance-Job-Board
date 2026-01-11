import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FindWorkLandingComponent } from './find-work-landing.component';
import { JobsBrowseComponent } from './jobs-browse.component';
import { SharedModule } from '../../shared/shared.module';
import { AuthGuard, OnboardingGuard } from '../../core/guards';

@NgModule({
  declarations: [FindWorkLandingComponent, JobsBrowseComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: FindWorkLandingComponent },
      { path: 'browse', component: JobsBrowseComponent, canActivate: [AuthGuard, OnboardingGuard] }
    ])
  ]
})
export class FindWorkModule {}
