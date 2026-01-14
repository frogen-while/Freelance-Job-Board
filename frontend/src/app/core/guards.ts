import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, switchMap, map, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.auth.isAuthReady().pipe(
      take(1),
      switchMap(() => this.auth.isLoggedIn$()),
      map(loggedIn => {
        if (loggedIn) {
          return true;
        }
        return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class OnboardingGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.isAuthReady().pipe(
      take(1),
      switchMap(() => this.auth.isLoggedIn$()),
      switchMap(loggedIn => {
        if (!loggedIn) {
          return of(this.router.createUrlTree(['/login']));
        }
        return this.auth.needsOnboarding$().pipe(
          map(needsOnboarding => {
            if (needsOnboarding) {
              return this.router.createUrlTree(['/onboarding']);
            }
            return true;
          })
        );
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.isAuthReady().pipe(
      take(1),
      switchMap(() => this.auth.isLoggedIn$()),
      switchMap(loggedIn => {
        if (!loggedIn) {
          return of(true);
        }
        return this.auth.needsOnboarding$().pipe(
          map(needsOnboarding => {
            if (needsOnboarding) {
              return this.router.createUrlTree(['/onboarding']);
            }
            return this.router.createUrlTree(['/dashboard']);
          })
        );
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class OnboardingPageGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.isAuthReady().pipe(
      take(1),
      switchMap(() => this.auth.isLoggedIn$()),
      switchMap(loggedIn => {
        if (!loggedIn) {
          return of(this.router.createUrlTree(['/login']));
        }
        return this.auth.needsOnboarding$().pipe(
          map(needsOnboarding => {
            if (!needsOnboarding) {
              return this.router.createUrlTree(['/dashboard']);
            }
            return true;
          })
        );
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class FreelancerGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.isAuthReady().pipe(
      take(1),
      switchMap(() => this.auth.isLoggedIn$()),
      switchMap(loggedIn => {
        if (!loggedIn) {
          return of(this.router.createUrlTree(['/login']));
        }
        return this.auth.isFreelancer$().pipe(
          map(isFreelancer => {
            if (!isFreelancer) {
              return this.router.createUrlTree(['/dashboard']);
            }
            return true;
          })
        );
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class EmployerGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.isAuthReady().pipe(
      take(1),
      switchMap(() => this.auth.isLoggedIn$()),
      switchMap(loggedIn => {
        if (!loggedIn) {
          return of(this.router.createUrlTree(['/login']));
        }
        return this.auth.isEmployer$().pipe(
          map(isEmployer => {
            if (!isEmployer) {
              return this.router.createUrlTree(['/dashboard']);
            }
            return true;
          })
        );
      })
    );
  }
}
