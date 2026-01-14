import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: { message: string } };

export type UserType = 'Employer' | 'Freelancer';

export type PublicUser = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  main_role: string;
  user_types?: UserType[];
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

  isFreelancer(): boolean {
    const user = this.getUser();
    return user?.user_types?.includes('Freelancer') ?? false;
  }

  isEmployer(): boolean {
    const user = this.getUser();
    return user?.user_types?.includes('Employer') ?? false;
  }

  needsOnboarding(): boolean {
    const user = this.getUser();
    return user?.onboarding_completed === false;
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
    type_name?: 'Employer' | 'Freelancer';
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
