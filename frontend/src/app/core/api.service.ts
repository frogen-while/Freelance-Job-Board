import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = environment.apiBase;
  constructor(private http: HttpClient) {}

  getJobs() { return this.http.get(`${this.base}/jobs`); }
  getJobById(id: number) { return this.http.get(`${this.base}/jobs/${id}`); }
  getCategories() { return this.http.get(`${this.base}/categories`); }

  applyToJob(payload: { job_id: number, freelancer_id: number, bid_amount: number, proposal_text: string, status: string }) {
    return this.http.post(`${this.base}/jobapplications`, payload);
  }
}