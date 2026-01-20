import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

type ApiEnvelope<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: { message: string; code?: string; details?: unknown };
};

export type MainRole = 'Admin' | 'Manager' | 'Support' | 'Employer' | 'Freelancer';

export type PublicUser = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  main_role: MainRole;
  onboarding_completed?: boolean;
};

type AuthResponse = {
  token: string;
  user: PublicUser;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'token';
  private readonly userKey = 'auth_user';
  private readonly base = environment.apiBase;
  
  private authReady$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    // Auth state is ready immediately since we use localStorage
    this.authReady$.next(true);
  }

  isAuthReady(): Observable<boolean> {
    return this.authReady$.asObservable();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isLoggedIn$(): Observable<boolean> {
    return of(this.isLoggedIn());
  }

  isFreelancer$(): Observable<boolean> {
    return of(this.isFreelancer());
  }

  isEmployer$(): Observable<boolean> {
    return of(this.isEmployer());
  }

  needsOnboarding$(): Observable<boolean> {
    return of(this.needsOnboarding());
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): PublicUser | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PublicUser;
    } catch {
      return null;
    }
  }

  getUser$(): Observable<PublicUser | null> {
    return of(this.getUser());
  }

  isFreelancer(): boolean {
    const user = this.getUser();
    return user?.main_role === 'Freelancer';
  }

  isEmployer(): boolean {
    const user = this.getUser();
    return user?.main_role === 'Employer';
  }

  needsOnboarding(): boolean {
    const user = this.getUser();
    return user?.onboarding_completed === false;
  }

  // Admin role checks (using standard: Admin, Manager, Support)
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.main_role === 'Admin';
  }

  isManager(): boolean {
    const user = this.getUser();
    return user?.main_role === 'Manager' || user?.main_role === 'Admin';
  }

  isSupport(): boolean {
    const user = this.getUser();
    return ['Support', 'Manager', 'Admin'].includes(user?.main_role || '');
  }

  isAdminRole(): boolean {
    const user = this.getUser();
    return ['Admin', 'Manager', 'Support'].includes(user?.main_role || '');
  }

  // Staff-only: Admin/Manager/Support roles
  isStaffOnly(): boolean {
    const user = this.getUser();
    if (!user) return false;
    return ['Admin', 'Manager', 'Support'].includes(user.main_role);
  }

  isAdmin$(): Observable<boolean> {
    return of(this.isAdmin());
  }

  isManager$(): Observable<boolean> {
    return of(this.isManager());
  }

  isSupport$(): Observable<boolean> {
    return of(this.isSupport());
  }

  isAdminRole$(): Observable<boolean> {
    return of(this.isAdminRole());
  }

  updateUser(user: PublicUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  login(email: string, password: string): Observable<ApiEnvelope<AuthResponse>> {
    return this.http
      .post<ApiEnvelope<AuthResponse>>(`${this.base}/auth/login`, { email, password })
      .pipe(tap((res) => this.persistIfSuccess(res)));
  }

  register(payload: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    main_role: 'Employer' | 'Freelancer';
  }): Observable<ApiEnvelope<AuthResponse>> {
    return this.http
      .post<ApiEnvelope<AuthResponse>>(`${this.base}/auth/register`, payload)
      .pipe(tap((res) => this.persistIfSuccess(res)));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  private persistIfSuccess(res: ApiEnvelope<AuthResponse>) {
    if (!('success' in res) || res.success !== true) return;
    localStorage.setItem(this.tokenKey, res.data.token);
    localStorage.setItem(this.userKey, JSON.stringify(res.data.user));
  }
}
