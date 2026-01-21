import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { FormatService } from '../../core/format.service';
import { FreelancerProfile, Category } from '../../core/models';

@Component({
  selector: 'app-freelancers-list',
  templateUrl: './freelancers-list.component.html',
  styleUrls: ['./freelancers-list.component.scss']
})
export class FreelancersListComponent implements OnInit {
  freelancers: FreelancerProfile[] = [];
  categories: Category[] = [];
  loading = true;
  total = 0;

  searchQuery = '';
  selectedCategory: number | null = null;
  currentPage = 1;
  pageSize = 12;

  isLoggedIn = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public fmt: FormatService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.loadCategories();

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['skill'] || '';
      this.selectedCategory = params['category'] ? Number(params['category']) : null;
      this.currentPage = params['page'] ? Number(params['page']) : 1;
      this.loadFreelancers();
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

  loadFreelancers() {
    this.loading = true;
    const offset = (this.currentPage - 1) * this.pageSize;

    this.api.getFreelancers({
      skill: this.searchQuery || undefined,
      limit: this.pageSize,
      offset
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.freelancers = res.data.freelancers;
          this.total = res.data.total;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.updateQueryParams();
  }

  onCategoryChange(categoryId: number | null) {
    this.selectedCategory = categoryId;
    this.currentPage = 1;
    this.updateQueryParams();
  }

  updateQueryParams() {
    const params: any = {};
    if (this.searchQuery) params.skill = this.searchQuery;
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.currentPage > 1) params.page = this.currentPage;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: ''
    });
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.currentPage = 1;
    this.router.navigate(['/hire/browse']);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateQueryParams();
    }
  }

  getDisplayName(freelancer: FreelancerProfile): string {
    return `${freelancer.first_name} ${freelancer.last_name?.charAt(0) || ''}.`;
  }

  formatRating(rating: number | null): string {
    if (!rating) return '';
    return rating.toFixed(1);
  }

  onViewProfile(freelancer: FreelancerProfile): void {
    this.router.navigate(['/profile', freelancer.user_id]);
  }
}
