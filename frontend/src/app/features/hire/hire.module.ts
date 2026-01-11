import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HireLandingComponent } from './hire-landing.component';
import { FreelancersListComponent } from './freelancers-list.component';
import { SharedModule } from '../../shared/shared.module';
import { AuthGuard, OnboardingGuard } from '../../core/guards';

@NgModule({
  declarations: [HireLandingComponent, FreelancersListComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: HireLandingComponent },
      { path: 'browse', component: FreelancersListComponent, canActivate: [AuthGuard, OnboardingGuard] }
    ])
  ]
})
export class HireModule {}
