import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OnboardingWizardComponent } from './onboarding-wizard.component';

const routes: Routes = [
  { path: '', component: OnboardingWizardComponent }
];

@NgModule({
  declarations: [OnboardingWizardComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class OnboardingModule {}
