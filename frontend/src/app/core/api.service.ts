import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Job, Category, FreelancerProfile, FreelancersResponse, Skill } from './models';

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

  getProfileByUserId(userId: number): Observable<any> {
    return this.http.get<any>(`${this.base}/profiles/${userId}`);
  }

  getUserById(userId: number): Observable<ApiResponse<{ user_id: number; first_name: string; last_name: string; email: string }>> {
    return this.http.get<ApiResponse<{ user_id: number; first_name: string; last_name: string; email: string }>>(`${this.base}/users/${userId}`);
  }

  getCategoryById(categoryId: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.base}/categories/${categoryId}`);
  }

  getFreelancers(options?: { skill?: string; limit?: number; offset?: number }): Observable<ApiResponse<FreelancersResponse>> {
    let url = `${this.base}/profiles/freelancers`;
    const params: string[] = [];
    
    if (options?.skill) params.push(`skill=${encodeURIComponent(options.skill)}`);
    if (options?.limit) params.push(`limit=${options.limit}`);
    if (options?.offset) params.push(`offset=${options.offset}`);
    
    if (params.length > 0) url += `?${params.join('&')}`;
    
    return this.http.get<ApiResponse<FreelancersResponse>>(url);
  }

  getFeaturedFreelancers(limit: number = 6): Observable<ApiResponse<FreelancerProfile[]>> {
    return this.http.get<ApiResponse<FreelancerProfile[]>>(`${this.base}/profiles/freelancers/featured?limit=${limit}`);
  }

  getSkills(): Observable<ApiResponse<Skill[]>> {
    return this.http.get<ApiResponse<Skill[]>>(`${this.base}/skills`);
  }

  getProfileSkills(userId: number): Observable<ApiResponse<Skill[]>> {
    return this.http.get<ApiResponse<Skill[]>>(`${this.base}/profiles/${userId}/skills`);
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

  updateProfile(userId: number, data: {
    display_name?: string;
    headline?: string;
    description?: string;
    photo_url?: string | null;
    location?: string | null;
    hourly_rate?: number | null;
    availability_status?: string;
    skills?: number[];
    onboarding_completed?: boolean;
  }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.base}/profiles/${userId}`, data);
  }
}