import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Job, Category } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  getJobs(): Observable<ApiResponse<Job[]>> {
    return this.http.get<ApiResponse<Job[]>>(`${this.base}/jobs`);
  }

  getJobsByCategory(categoryId: number): Observable<ApiResponse<Job[]>> {
    return this.http.get<ApiResponse<Job[]>>(`${this.base}/jobs?category=${categoryId}`);
  }

  getJobById(id: number): Observable<ApiResponse<Job>> {
    return this.http.get<ApiResponse<Job>>(`${this.base}/jobs/${id}`);
  }

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.base}/categories`);
  }

  applyToJob(payload: {
    job_id: number;
    freelancer_id: number;
    bid_amount: number;
    proposal_text: string;
    status: string;
  }): Observable<ApiResponse<{ application_id: number }>> {
    return this.http.post<ApiResponse<{ application_id: number }>>(`${this.base}/jobapplications`, payload);
  }
}