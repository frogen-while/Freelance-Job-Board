import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  ApiResponse, 
  Job, 
  Category, 
  FreelancerProfile, 
  FreelancersResponse, 
  Skill,
  EmployerProfile,
  EmployersResponse,
  FreelancerProfileData,
  EmployerProfileData,
  JobFilters,
  CreateJobPayload,
  ExperienceLevel,
  AvailabilityStatus,
  CompanySize,
  JobApplication,
  Message,
  Conversation
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  // ============ JOBS ============

  getJobs(filters?: JobFilters): Observable<ApiResponse<Job[]>> {
    let url = `${this.base}/jobs`;
    const params: string[] = [];
    
    if (filters?.q) params.push(`q=${encodeURIComponent(filters.q)}`);
    if (filters?.category_id) params.push(`category=${filters.category_id}`);
    if (filters?.status) params.push(`status=${encodeURIComponent(filters.status)}`);
    if (filters?.experience_level) params.push(`experience_level=${filters.experience_level}`);
    if (filters?.job_type) params.push(`job_type=${filters.job_type}`);
    if (filters?.is_remote !== undefined) params.push(`is_remote=${filters.is_remote}`);
    if (filters?.budget_min) params.push(`budget_min=${filters.budget_min}`);
    if (filters?.budget_max) params.push(`budget_max=${filters.budget_max}`);
    if (filters?.skills && filters.skills.length > 0) params.push(`skills=${filters.skills.join(',')}`);
    
    if (params.length > 0) url += `?${params.join('&')}`;
    
    return this.http.get<ApiResponse<Job[]>>(url);
  }

  getJobsByCategory(categoryId: number): Observable<ApiResponse<Job[]>> {
    return this.http.get<ApiResponse<Job[]>>(`${this.base}/jobs?category=${categoryId}`);
  }

  getJobsByEmployerId(employerId: number): Observable<ApiResponse<Job[]>> {
    return this.http.get<ApiResponse<Job[]>>(`${this.base}/jobs/employer/${employerId}`);
  }

  getJobById(id: number): Observable<ApiResponse<Job>> {
    return this.http.get<ApiResponse<Job>>(`${this.base}/jobs/${id}`);
  }

  createJob(payload: CreateJobPayload): Observable<ApiResponse<{ job_id: number }>> {
    return this.http.post<ApiResponse<{ job_id: number }>>(`${this.base}/jobs`, payload);
  }

  updateJob(jobId: number, data: Partial<CreateJobPayload>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.base}/jobs/${jobId}`, data);
  }

  // ============ CATEGORIES ============

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.base}/categories`);
  }

  getCategoryById(categoryId: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.base}/categories/${categoryId}`);
  }

  // ============ USERS ============

  getUserById(userId: number): Observable<ApiResponse<{ user_id: number; first_name: string; last_name: string; email: string }>> {
    return this.http.get<ApiResponse<{ user_id: number; first_name: string; last_name: string; email: string }>>(`${this.base}/users/${userId}`);
  }

  // ============ BASE PROFILES ============

  getProfileByUserId(userId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.base}/profiles/${userId}`);
  }

  updateProfile(userId: number, data: {
    display_name?: string;
    headline?: string;
    description?: string;
    photo_url?: string | null;
    location?: string | null;
    skills?: number[];
    onboarding_completed?: boolean;
  }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.base}/profiles/${userId}`, data);
  }

  // ============ FREELANCER PROFILES ============

  getFreelancerProfile(userId: number): Observable<ApiResponse<FreelancerProfileData>> {
    return this.http.get<ApiResponse<FreelancerProfileData>>(`${this.base}/profiles/${userId}/freelancer`);
  }

  updateFreelancerProfile(userId: number, data: {
    title?: string | null;
    hourly_rate?: number | null;
    availability_status?: AvailabilityStatus | null;
    experience_level?: ExperienceLevel | null;
    github_url?: string | null;
    linkedin_url?: string | null;
  }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.base}/profiles/${userId}/freelancer`, data);
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

  // ============ EMPLOYER PROFILES ============

  getEmployerProfile(userId: number): Observable<ApiResponse<EmployerProfileData>> {
    return this.http.get<ApiResponse<EmployerProfileData>>(`${this.base}/profiles/${userId}/employer`);
  }

  updateEmployerProfile(userId: number, data: {
    company_name?: string | null;
    company_description?: string | null;
    company_website?: string | null;
    company_size?: CompanySize | null;
    industry?: string | null;
  }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.base}/profiles/${userId}/employer`, data);
  }

  getEmployers(options?: { limit?: number; offset?: number }): Observable<ApiResponse<EmployersResponse>> {
    let url = `${this.base}/profiles/employers`;
    const params: string[] = [];
    
    if (options?.limit) params.push(`limit=${options.limit}`);
    if (options?.offset) params.push(`offset=${options.offset}`);
    
    if (params.length > 0) url += `?${params.join('&')}`;
    
    return this.http.get<ApiResponse<EmployersResponse>>(url);
  }

  // ============ SKILLS ============

  getSkills(): Observable<ApiResponse<Skill[]>> {
    return this.http.get<ApiResponse<Skill[]>>(`${this.base}/skills`);
  }

  getProfileSkills(userId: number): Observable<ApiResponse<Skill[]>> {
    return this.http.get<ApiResponse<Skill[]>>(`${this.base}/profiles/${userId}/skills`);
  }

  // ============ JOB APPLICATIONS ============

  applyToJob(payload: {
    job_id: number;
    freelancer_id: number;
    bid_amount: number;
    proposal_text: string;
    status: string;
  }): Observable<ApiResponse<{ application_id: number }>> {
    return this.http.post<ApiResponse<{ application_id: number }>>(`${this.base}/jobapplications`, payload);
  }

  getApplicationsByJobId(jobId: number): Observable<ApiResponse<JobApplication[]>> {
    return this.http.get<ApiResponse<JobApplication[]>>(`${this.base}/jobapplications/job/${jobId}`);
  }

  getApplicationsByFreelancerId(freelancerId: number): Observable<ApiResponse<JobApplication[]>> {
    return this.http.get<ApiResponse<JobApplication[]>>(`${this.base}/jobapplications/freelancer/${freelancerId}`);
  }

  updateApplicationStatus(applicationId: number, status: 'Pending' | 'Accepted' | 'Rejected'): Observable<ApiResponse<{ message: string }>> {
    return this.http.patch<ApiResponse<{ message: string }>>(`${this.base}/jobapplications/${applicationId}/status`, { status });
  }

  // ============ MESSAGES ============

  getMessages(): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(`${this.base}/messages`);
  }

  getMessagesByUser(userId: number): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(`${this.base}/messages/user/${userId}`);
  }

  getConversation(userId1: number, userId2: number): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(`${this.base}/messages/conversation/${userId1}/${userId2}`);
  }

  getMessagesByJob(jobId: number): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(`${this.base}/messages/job/${jobId}`);
  }

  sendMessage(payload: { sender_id: number; receiver_id: number; job_id?: number; body: string }): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(`${this.base}/messages`, payload);
  }

  markMessageAsRead(messageId: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.patch<ApiResponse<{ message: string }>>(`${this.base}/messages/${messageId}/read`, {});
  }

  markAllMessagesAsRead(receiverId: number, senderId: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.post<ApiResponse<{ message: string }>>(`${this.base}/messages/read-all`, { receiver_id: receiverId, sender_id: senderId });
  }

  getUnreadCount(userId: number): Observable<ApiResponse<{ unread_count: number }>> {
    return this.http.get<ApiResponse<{ unread_count: number }>>(`${this.base}/messages/user/${userId}/unread`);
  }

  getConversations(userId: number): Observable<ApiResponse<Conversation[]>> {
    return this.http.get<ApiResponse<Conversation[]>>(`${this.base}/messages/user/${userId}/conversations`);
  }

  // ============ SUPPORT TICKETS ============

  createSupportTicket(payload: {
    user_id: number;
    support_id: number;
    subject: string;
    message: string;
    status: string;
  }): Observable<ApiResponse<{ ticket_id: number }>> {
    return this.http.post<ApiResponse<{ ticket_id: number }>>(`${this.base}/supporttickets`, payload);
  }

  getAllSupportTickets(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.base}/supporttickets`);
  }

  getSupportTicketById(ticketId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.base}/supporttickets/${ticketId}`);
  }

  getUserSupportTickets(userId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.base}/supporttickets?user_id=${userId}`);
  }

  updateSupportTicket(ticketId: number, data: {
    subject?: string;
    message?: string;
    status?: string;
  }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.base}/supporttickets/${ticketId}`, data);
  }

  deleteSupportTicket(ticketId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.base}/supporttickets/${ticketId}`);
  }
}