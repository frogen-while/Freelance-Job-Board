import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HireLandingComponent } from './hire-landing.component';
import { FreelancersListComponent } from './freelancers-list.component';
import { JobCreateComponent } from './job-create.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [HireLandingComponent, FreelancersListComponent, JobCreateComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: HireLandingComponent },
      { path: 'browse', component: FreelancersListComponent },
      { path: 'post-job', component: JobCreateComponent }
    ])
  ]
})
export class HireModule {}
