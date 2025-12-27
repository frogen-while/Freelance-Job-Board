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

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getCategories().subscribe(res => this.categories = res.data || []);
  }
}