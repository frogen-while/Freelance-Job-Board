import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { Category } from '../../core/models';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  errorMessage = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';
    this.api.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load categories. Please try again.';
      }
    });
  }
}