import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from "./features/home/home.component";
import { AboutComponent } from './features/about/about.component';
import { ProfileComponent } from './features/profile/profile.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { SupportComponent } from './features/support/support.component';
import { AuthGuard, OnboardingGuard, GuestGuard, OnboardingPageGuard, FreelancerGuard, EmployerGuard, AdminRoleGuard } from './core/guards';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [GuestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
  { path: 'onboarding', loadChildren: () => import('./features/onboarding/onboarding.module').then(m => m.OnboardingModule), canActivate: [OnboardingPageGuard] },
  { path: 'about', component: AboutComponent },
  { path: 'support', component: SupportComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard, OnboardingGuard] },
  { path: 'profile/:userId', component: ProfileComponent, canActivate: [AuthGuard, OnboardingGuard] },
  { path: 'jobs', loadChildren: () => import('./features/jobs/jobs.module').then(m => m.JobsModule) },
  { path: 'hire', loadChildren: () => import('./features/hire/hire.module').then(m => m.HireModule) },
  { path: 'find-work', loadChildren: () => import('./features/find-work/find-work.module').then(m => m.FindWorkModule) },
  { path: 'messages', loadChildren: () => import('./features/messages/messages.module').then(m => m.MessagesModule), canActivate: [AuthGuard, OnboardingGuard] },
  { path: 'my-proposals', loadChildren: () => import('./features/my-proposals/my-proposals.module').then(m => m.MyProposalsModule), canActivate: [AuthGuard, OnboardingGuard, FreelancerGuard] },
  { path: 'my-jobs', loadChildren: () => import('./features/my-jobs/my-jobs.module').then(m => m.MyJobsModule), canActivate: [AuthGuard, OnboardingGuard, EmployerGuard] },
  { path: 'admin', loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule), canActivate: [AuthGuard, AdminRoleGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
