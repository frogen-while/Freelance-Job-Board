import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Category } from '../../core/models';

interface CategoryDisplay {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  search = '';

  private defaultCategories: CategoryDisplay[] = [
    { name: 'Development & IT', icon: '' },
    { name: 'Design & Creative', icon: '' },
    { name: 'Sales & Marketing', icon: '' },
    { name: 'Writing & Translation', icon: '' },
    { name: 'Admin & Customer Support', icon: '' },
    { name: 'Finance & Accounting', icon: '' },
    { name: 'Engineering & Architecture', icon: '' },
    { name: 'Legal', icon: '' },
    { name: 'Data Science & Analytics', icon: '' },
    { name: 'Video & Animation', icon: '' }
  ];

  get displayCategories(): CategoryDisplay[] {
    if (this.categories.length === 0) {
      return this.defaultCategories;
    }
    return this.categories.slice(0, 10).map(c => ({
      name: c.name,
      icon: ''
    }));
  }

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getCategories().subscribe(res => {
      this.categories = res.data || [];
    });
  }

  onExplore() {
    this.router.navigate(['/login']);
  }
}
