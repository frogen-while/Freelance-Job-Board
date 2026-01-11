import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from "./features/home/home.component";
import { CategoriesComponent } from './features/categories/categories.component';
import { AboutComponent } from './features/about/about.component';
import { ProfileComponent } from './features/profile/profile.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { AuthGuard, OnboardingGuard, GuestGuard, OnboardingPageGuard, FreelancerGuard, EmployerGuard } from './core/guards';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [GuestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
  { path: 'onboarding', loadChildren: () => import('./features/onboarding/onboarding.module').then(m => m.OnboardingModule), canActivate: [OnboardingPageGuard] },
  { path: 'categories', component: CategoriesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard, OnboardingGuard] },
  { path: 'jobs', loadChildren: () => import('./features/jobs/jobs.module').then(m => m.JobsModule) },
  // Landing pages accessible to all, browse pages have guards inside modules
  { path: 'hire', loadChildren: () => import('./features/hire/hire.module').then(m => m.HireModule) },
  { path: 'find-work', loadChildren: () => import('./features/find-work/find-work.module').then(m => m.FindWorkModule) },
  // Dashboard - requires auth and onboarding
  { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard, OnboardingGuard] },
  // Functional pages
  { path: 'my-proposals', loadChildren: () => import('./features/my-proposals/my-proposals.module').then(m => m.MyProposalsModule), canActivate: [AuthGuard, OnboardingGuard, FreelancerGuard] },
  { path: 'my-jobs', loadChildren: () => import('./features/my-jobs/my-jobs.module').then(m => m.MyJobsModule), canActivate: [AuthGuard, OnboardingGuard, EmployerGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
