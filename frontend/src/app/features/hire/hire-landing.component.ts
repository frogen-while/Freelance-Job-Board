import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Category, FreelancerProfile } from '../../core/models';

@Component({
  selector: 'app-hire-landing',
  templateUrl: './hire-landing.component.html',
  styleUrls: ['./hire-landing.component.scss']
})
export class HireLandingComponent implements OnInit {
  featuredFreelancers: FreelancerProfile[] = [];
  categories: Category[] = [];
  searchQuery = '';
  loading = true;

  benefits = [
    {
      icon: 'star',
      title: 'Verified Professionals',
      description: 'Work with pre-vetted talent who have proven their skills'
    },
    {
      icon: 'shield',
      title: 'Secure Payments',
      description: 'Your payment is protected until you approve the work'
    },
    {
      icon: 'users',
      title: 'Find the Right Fit',
      description: 'Browse profiles, portfolios, and reviews to find your match'
    }
  ];

  howItWorks = [
    {
      step: 1,
      title: 'Post Your Project',
      description: 'Describe your project and the skills you need. It only takes a few minutes.'
    },
    {
      step: 2,
      title: 'Review Proposals',
      description: 'Receive proposals from talented freelancers and review their profiles.'
    },
    {
      step: 3,
      title: 'Hire & Collaborate',
      description: 'Choose the best fit, collaborate on your project, and pay securely.'
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

    this.api.getFeaturedFreelancers(6).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.featuredFreelancers = res.data;
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
          this.categories = res.data.slice(0, 8);
        }
      }
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/hire/browse'], { 
        queryParams: { skill: this.searchQuery.trim() } 
      });
    } else {
      this.router.navigate(['/hire/browse']);
    }
  }

  getInitials(freelancer: FreelancerProfile): string {
    const fn = freelancer.first_name?.charAt(0).toUpperCase() || '';
    const ln = freelancer.last_name?.charAt(0).toUpperCase() || '';
    return fn + ln;
  }

  getDisplayName(freelancer: FreelancerProfile): string {
    if (freelancer.display_name) return freelancer.display_name;
    return `${freelancer.first_name} ${freelancer.last_name?.charAt(0)}.`;
  }

  browseTalent() {
    this.router.navigate(['/hire/browse']);
  }

  postJob() {
    this.router.navigate(['/jobs/create']);
  }
}
