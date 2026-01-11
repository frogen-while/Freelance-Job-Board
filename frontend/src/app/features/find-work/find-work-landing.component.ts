import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Category, Job } from '../../core/models';

@Component({
  selector: 'app-find-work-landing',
  templateUrl: './find-work-landing.component.html',
  styleUrls: ['./find-work-landing.component.scss']
})
export class FindWorkLandingComponent implements OnInit {
  recentJobs: Job[] = [];
  categories: Category[] = [];
  searchQuery = '';
  loading = true;

  stats = [
    { value: '10K+', label: 'Active Jobs' },
    { value: '50K+', label: 'Freelancers' },
    { value: '$5M+', label: 'Paid to Freelancers' },
    { value: '95%', label: 'Satisfaction Rate' }
  ];

  whyJoin = [
    {
      icon: 'briefcase',
      title: 'Quality Projects',
      description: 'Access thousands of projects from verified clients worldwide'
    },
    {
      icon: 'dollar',
      title: 'Competitive Pay',
      description: 'Set your own rates and get paid securely for your work'
    },
    {
      icon: 'clock',
      title: 'Flexible Schedule',
      description: 'Work when you want, where you want, on projects you choose'
    },
    {
      icon: 'trending',
      title: 'Grow Your Career',
      description: 'Build your portfolio and reputation with every project'
    }
  ];

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.api.getJobs().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.recentJobs = res.data.slice(0, 6);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

    this.api.getCategories().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories = res.data.slice(0, 12);
        }
      }
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/find-work/browse'], { 
        queryParams: { q: this.searchQuery.trim() } 
      });
    } else {
      this.router.navigate(['/find-work/browse']);
    }
  }

  browseJobs() {
    this.router.navigate(['/find-work/browse']);
  }

  getCategoryIcon(categoryName: string): string {
    const icons: { [key: string]: string } = {
      'Web Development': 'code',
      'Mobile Development': 'smartphone',
      'Design': 'palette',
      'Writing': 'edit',
      'Marketing': 'trending',
      'default': 'briefcase'
    };
    return icons[categoryName] || icons['default'];
  }
}
