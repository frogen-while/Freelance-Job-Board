import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  base = environment.apiBase;
  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post(`${this.base}/users/login`, { email, password });
  }

  register(name: string, email: string, password: string) {
    return this.http.post(`${this.base}/users`, { name, email, password });
  }

  setToken(token: string) { localStorage.setItem('token', token); }
  getToken(): string | null { return localStorage.getItem('token'); }
  logout() { localStorage.removeItem('token'); }
}
