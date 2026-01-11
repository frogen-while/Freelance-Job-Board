import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from "./features/home/home.component";
import { CategoriesComponent } from './features/categories/categories.component';
import { AboutComponent } from './features/about/about.component';
import { ProfileComponent } from './features/profile/profile.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { AuthGuard, OnboardingGuard, GuestGuard, OnboardingPageGuard } from './core/guards';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [GuestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
  { path: 'onboarding', loadChildren: () => import('./features/onboarding/onboarding.module').then(m => m.OnboardingModule), canActivate: [OnboardingPageGuard] },
  { path: 'categories', component: CategoriesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard, OnboardingGuard] },
  { path: 'jobs', loadChildren: () => import('./features/jobs/jobs.module').then(m => m.JobsModule) },
  { path: 'hire', loadChildren: () => import('./features/hire/hire.module').then(m => m.HireModule), canActivate: [AuthGuard, OnboardingGuard] },
  { path: 'find-work', loadChildren: () => import('./features/find-work/find-work.module').then(m => m.FindWorkModule), canActivate: [AuthGuard, OnboardingGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
