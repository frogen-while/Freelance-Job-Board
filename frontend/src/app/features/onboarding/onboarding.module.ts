import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { OnboardingWizardComponent } from './onboarding-wizard.component';

const routes: Routes = [
  { path: '', component: OnboardingWizardComponent }
];

@NgModule({
  declarations: [OnboardingWizardComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class OnboardingModule {}
