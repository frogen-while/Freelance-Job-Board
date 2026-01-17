import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Job, Category, Skill, JobFilters, ExperienceLevel, JobType } from '../../core/models';

@Component({
  selector: 'app-jobs-browse',
  templateUrl: './jobs-browse.component.html',
  styleUrls: ['./jobs-browse.component.scss']
})
export class JobsBrowseComponent implements OnInit {
  jobs: Job[] = [];
  allJobs: Job[] = [];
  categories: Category[] = [];
  skills: Skill[] = [];
  loading = true;
  
  searchQuery = '';
  selectedCategory: number | null = null;
  selectedStatus: string = '';
  selectedExperience: ExperienceLevel | '' = '';
  selectedJobType: JobType | '' = '';
  remoteOnly = false;
  selectedSkills: number[] = [];
  budgetMin: number | null = null;
  budgetMax: number | null = null;
  showFilters = false;
  
  isLoggedIn = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.loadCategories();
    this.loadSkills();
    
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.selectedCategory = params['category'] ? Number(params['category']) : null;
      this.selectedStatus = params['status'] || '';
      this.selectedExperience = params['experience'] || '';
      this.selectedJobType = params['job_type'] || '';
      this.remoteOnly = params['remote'] === 'true';
      this.loadJobs();
    });
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories = res.data;
        }
      }
    });
  }

  loadSkills() {
    this.api.getSkills().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.skills = res.data;
        }
      }
    });
  }

  loadJobs() {
    this.loading = true;

    const filters: JobFilters = {};
    if (this.selectedCategory) filters.category_id = this.selectedCategory;
    if (this.selectedExperience) filters.experience_level = this.selectedExperience;
    if (this.selectedJobType) filters.job_type = this.selectedJobType;
    if (this.remoteOnly) filters.is_remote = true;
    if (this.budgetMin) filters.budget_min = this.budgetMin;
    if (this.budgetMax) filters.budget_max = this.budgetMax;
    if (this.selectedSkills.length) filters.skills = this.selectedSkills;

    this.api.getJobs(filters).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.allJobs = res.data;
          this.filterJobs();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterJobs() {
    let filtered = [...this.allJobs];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(job => job.status === this.selectedStatus);
    }

    this.jobs = filtered;
  }

  onSearch() {
    this.updateQueryParams();
  }

  onCategoryChange(categoryId: number | null) {
    this.selectedCategory = categoryId;
    this.updateQueryParams();
  }

  onStatusChange(status: string) {
    this.selectedStatus = status;
    this.filterJobs();
    this.updateQueryParams();
  }

  onExperienceChange(exp: ExperienceLevel | '') {
    this.selectedExperience = exp;
    this.loadJobs();
    this.updateQueryParams();
  }

  onJobTypeChange(jobType: JobType | '') {
    this.selectedJobType = jobType;
    this.loadJobs();
    this.updateQueryParams();
  }

  onRemoteChange(remote: boolean) {
    this.remoteOnly = remote;
    this.loadJobs();
    this.updateQueryParams();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  updateQueryParams() {
    const params: any = {};
    if (this.searchQuery) params.q = this.searchQuery;
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.selectedStatus) params.status = this.selectedStatus;
    if (this.selectedExperience) params.experience = this.selectedExperience;
    if (this.selectedJobType) params.job_type = this.selectedJobType;
    if (this.remoteOnly) params.remote = 'true';

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: ''
    });
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.selectedStatus = '';
    this.selectedExperience = '';
    this.selectedJobType = '';
    this.remoteOnly = false;
    this.selectedSkills = [];
    this.budgetMin = null;
    this.budgetMax = null;
    this.router.navigate(['/find-work/browse']);
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedCategory || this.selectedStatus || this.selectedExperience || 
              this.selectedJobType || this.remoteOnly || this.searchQuery);
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.selectedCategory) count++;
    if (this.selectedStatus) count++;
    if (this.selectedExperience) count++;
    if (this.selectedJobType) count++;
    if (this.remoteOnly) count++;
    return count;
  }

  getExperienceLabel(exp: string): string {
    const labels: Record<string, string> = {
      'entry': 'Entry Level',
      'intermediate': 'Intermediate',
      'expert': 'Expert'
    };
    return labels[exp] || '';
  }

  getJobTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'fixed': 'Fixed Price',
      'hourly': 'Hourly',
      'one_time': 'One-time',
      'ongoing': 'Ongoing',
      'contract': 'Contract'
    };
    return labels[type] || type || '';
  }

  getSkillName(skillId: number): string {
    const skill = this.skills.find(s => s.skill_id === skillId);
    return skill?.name || '';
  }

  getCategoryName(categoryId: number): string {
    const cat = this.categories.find(c => c.category_id === categoryId);
    return cat?.name || '';
  }

  formatBudget(budget: number): string {
    if (budget >= 1000) {
      return `$${(budget / 1000).toFixed(budget % 1000 === 0 ? 0 : 1)}k`;
    }
    return `$${budget}`;
  }

  getTimeAgo(dateStr: string): string {
    if (!dateStr) return 'Recently posted';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  onViewJob(job: Job): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/jobs', job.job_id]);
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/jobs/' + job.job_id } });
    }
  }
}
