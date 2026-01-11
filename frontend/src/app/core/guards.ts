import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    }
    
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class OnboardingGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (this.auth.needsOnboarding()) {
      this.router.navigate(['/onboarding']);
      return false;
    }

    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.auth.isLoggedIn()) {
      return true;
    }

    // Logged in users go to their respective browse page
    if (this.auth.needsOnboarding()) {
      this.router.navigate(['/onboarding']);
    } else if (this.auth.isFreelancer()) {
      this.router.navigate(['/find-work/browse']);
    } else {
      this.router.navigate(['/hire/browse']);
    }
    
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class OnboardingPageGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // If already completed onboarding, redirect to appropriate page
    if (!this.auth.needsOnboarding()) {
      if (this.auth.isFreelancer()) {
        this.router.navigate(['/find-work/browse']);
      } else {
        this.router.navigate(['/hire/browse']);
      }
      return false;
    }

    return true;
  }
}
