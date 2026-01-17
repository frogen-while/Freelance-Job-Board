import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FreelancersListComponent } from './freelancers-list.component';
import { JobCreateComponent } from './job-create.component';
import { SharedModule } from '../../shared/shared.module';
import { AuthGuard, OnboardingGuard, EmployerGuard } from '../../core/guards';

@NgModule({
  declarations: [FreelancersListComponent, JobCreateComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'browse', pathMatch: 'full' },
      { path: 'browse', component: FreelancersListComponent },
      { path: 'post-job', component: JobCreateComponent, canActivate: [AuthGuard, OnboardingGuard, EmployerGuard] }
    ])
  ]
})
export class HireModule {}
