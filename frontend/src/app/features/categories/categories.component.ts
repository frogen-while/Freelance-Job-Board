import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.getCategories().subscribe((res: any) => this.categories = res.data || []); }
}