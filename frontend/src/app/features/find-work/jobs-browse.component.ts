import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Job, Category } from '../../core/models';

@Component({
  selector: 'app-jobs-browse',
  templateUrl: './jobs-browse.component.html',
  styleUrls: ['./jobs-browse.component.scss']
})
export class JobsBrowseComponent implements OnInit {
  jobs: Job[] = [];
  allJobs: Job[] = [];
  categories: Category[] = [];
  loading = true;
  
  searchQuery = '';
  selectedCategory: number | null = null;
  selectedStatus: string = '';
  
  isLoggedIn = false;
  showAuthModal = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.loadCategories();
    
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.selectedCategory = params['category'] ? Number(params['category']) : null;
      this.selectedStatus = params['status'] || '';
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

  loadJobs() {
    this.loading = true;

    const fetchJobs = this.selectedCategory 
      ? this.api.getJobsByCategory(this.selectedCategory)
      : this.api.getJobs();

    fetchJobs.subscribe({
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

  updateQueryParams() {
    const params: any = {};
    if (this.searchQuery) params.q = this.searchQuery;
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.selectedStatus) params.status = this.selectedStatus;

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
    this.router.navigate(['/find-work/browse']);
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

  getTimeAgo(date: string): string {
    // Simplified time ago
    return 'Recently posted';
  }

  onViewJob(job: Job): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/jobs', job.job_id]);
    } else {
      this.showAuthModal = true;
    }
  }

  closeAuthModal(): void {
    this.showAuthModal = false;
  }
}
