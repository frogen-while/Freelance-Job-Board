import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Job, Category } from '../../core/models';

@Component({
  selector: 'app-jobs-list',
  templateUrl: './jobs-list.component.html',
  styleUrls: ['./jobs-list.component.scss']
})
export class JobsListComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  categories: Category[] = [];
  selectedCategoryId: number | null = null;
  selectedCategoryName: string = '';
  isLoading = true;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.api.getCategories().subscribe(res => {
      if (res.success && res.data) {
        this.categories = res.data;
      }
      
      this.route.queryParams.subscribe(params => {
        const categoryId = params['category'] ? +params['category'] : null;
        this.selectedCategoryId = categoryId;
        
        if (categoryId) {
          const cat = this.categories.find(c => c.category_id === categoryId);
          this.selectedCategoryName = cat ? cat.name : '';
        } else {
          this.selectedCategoryName = '';
        }
        
        this.loadJobs();
      });
    });
  }

  loadJobs() {
    this.isLoading = true;
    this.api.getJobs().subscribe(res => {
      this.jobs = res.data || [];
      this.filterJobs();
      this.isLoading = false;
    });
  }

  filterJobs() {
    if (this.selectedCategoryId) {
      this.filteredJobs = this.jobs.filter(j => j.category_id === this.selectedCategoryId);
    } else {
      this.filteredJobs = this.jobs;
    }
  }

  truncateDescription(text: string, maxLength: number = 50): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getCategoryName(categoryId: number): string {
    const cat = this.categories.find(c => c.category_id === categoryId);
    return cat ? cat.name : '';
  }

  viewJob(jobId: number) {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/jobs', jobId]);
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/jobs/${jobId}` } });
    }
  }
}