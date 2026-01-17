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
      switchMap(() => this.auth.isLoggedIn$().pipe(take(1))),
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
      switchMap(() => this.auth.isLoggedIn$().pipe(take(1))),
      switchMap(loggedIn => {
        if (!loggedIn) {
          return of(this.router.createUrlTree(['/login']));
        }
        return this.auth.needsOnboarding$().pipe(
          take(1),
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
      switchMap(() => this.auth.isLoggedIn$().pipe(take(1))),
      switchMap(loggedIn => {
        if (!loggedIn) {
          return of(true);
        }
        if (this.auth.isAdminRole()) {
          return of(this.router.createUrlTree(['/admin']));
        }
        return this.auth.needsOnboarding$().pipe(
          take(1),
          map(needsOnboarding => {
            if (needsOnboarding) {
              return this.router.createUrlTree(['/onboarding']);
            }
            if (this.auth.isFreelancer()) {
              return this.router.createUrlTree(['/find-work/browse']);
            }
            return this.router.createUrlTree(['/my-jobs']);
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
      switchMap(() => this.auth.isLoggedIn$().pipe(take(1))),
      switchMap(loggedIn => {
        if (!loggedIn) {
          return of(this.router.createUrlTree(['/login']));
        }
        return this.auth.needsOnboarding$().pipe(
          take(1),
          map(needsOnboarding => {
            if (!needsOnboarding) {
              if (this.auth.isFreelancer()) {
                return this.router.createUrlTree(['/find-work/browse']);
              }
              return this.router.createUrlTree(['/my-jobs']);
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
      switchMap(() => this.auth.isLoggedIn$().pipe(take(1))),
      switchMap(loggedIn => {
        if (!loggedIn) {
          return of(this.router.createUrlTree(['/login']));
        }
        if (this.auth.isAdminRole()) {
          return of(true);
        }
        return this.auth.isFreelancer$().pipe(
          take(1),
          map(isFreelancer => {
            if (!isFreelancer) {
              return this.router.createUrlTree(['/my-jobs']);
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
      switchMap(() => this.auth.isLoggedIn$().pipe(take(1))),
      switchMap(loggedIn => {
        if (!loggedIn) {
          return of(this.router.createUrlTree(['/login']));
        }
        if (this.auth.isAdminRole()) {
          return of(true);
        }
        return this.auth.isEmployer$().pipe(
          take(1),
          map(isEmployer => {
            if (!isEmployer) {
              return this.router.createUrlTree(['/find-work/browse']);
            }
            return true;
          })
        );
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.isAuthReady().pipe(
      take(1),
      switchMap(() => this.auth.isLoggedIn$().pipe(take(1))),
      switchMap(loggedIn => {
        if (!loggedIn) {
          return of(this.router.createUrlTree(['/login']));
        }
        return this.auth.isAdmin$().pipe(
          take(1),
          map(isAdmin => {
            if (!isAdmin) {
              if (this.auth.isFreelancer()) {
                return this.router.createUrlTree(['/find-work/browse']);
              }
              return this.router.createUrlTree(['/my-jobs']);
            }
            return true;
          })
        );
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class ManagerGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.isAuthReady().pipe(
      take(1),
      switchMap(() => this.auth.isLoggedIn$().pipe(take(1))),
      switchMap(loggedIn => {
        if (!loggedIn) {
          return of(this.router.createUrlTree(['/login']));
        }
        return this.auth.isManager$().pipe(
          take(1),
          map(isManager => {
            if (!isManager) {
              if (this.auth.isFreelancer()) {
                return this.router.createUrlTree(['/find-work/browse']);
              }
              return this.router.createUrlTree(['/my-jobs']);
            }
            return true;
          })
        );
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class SupportGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.isAuthReady().pipe(
      take(1),
      switchMap(() => this.auth.isLoggedIn$().pipe(take(1))),
      switchMap(loggedIn => {
        if (!loggedIn) {
          return of(this.router.createUrlTree(['/login']));
        }
        return this.auth.isSupport$().pipe(
          take(1),
          map(isSupport => {
            if (!isSupport) {
              if (this.auth.isFreelancer()) {
                return this.router.createUrlTree(['/find-work/browse']);
              }
              return this.router.createUrlTree(['/my-jobs']);
            }
            return true;
          })
        );
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class AdminRoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.isAuthReady().pipe(
      take(1),
      switchMap(() => this.auth.isLoggedIn$().pipe(take(1))),
      switchMap(loggedIn => {
        if (!loggedIn) {
          return of(this.router.createUrlTree(['/login']));
        }
        return this.auth.isAdminRole$().pipe(
          take(1),
          map(isAdminRole => {
            if (!isAdminRole) {
              if (this.auth.isFreelancer()) {
                return this.router.createUrlTree(['/find-work/browse']);
              }
              return this.router.createUrlTree(['/my-jobs']);
            }
            return true;
          })
        );
      })
    );
  }
}
