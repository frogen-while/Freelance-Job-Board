import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  jobs: any[] = [];
  categories: any[] = [];
  activeTab: 'hire' | 'work' = 'hire';
  search = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getJobs().subscribe((res: any) => this.jobs = res.data || []);
    this.api.getCategories().subscribe((res: any) => this.categories = res.data || []);
  }

  setActiveTab(tab: 'hire' | 'work') {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
  }

  onSearch() {
    // naive client-side filter — backend search endpoint could be used instead
    const q = this.search.trim().toLowerCase();
    if (!q) {
      this.api.getJobs().subscribe((res: any) => this.jobs = res.data || []);
      return;
    }
    this.jobs = (this.jobs || []).filter(j => (j.title || '').toLowerCase().includes(q) || (j.description || '').toLowerCase().includes(q));
  }
}
