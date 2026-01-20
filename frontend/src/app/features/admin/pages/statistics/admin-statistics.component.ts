import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../../core/api.service';
import { OverviewStats, RevenueStats, UserStats, JobStats } from '../../../../core/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-statistics',
  templateUrl: './admin-statistics.component.html',
  styleUrls: ['./admin-statistics.component.scss']
})
export class AdminStatisticsComponent implements OnInit, AfterViewInit {
  @ViewChild('userChart') userChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('jobChart') jobChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;

  overviewStats: OverviewStats | null = null;
  revenueStats: RevenueStats | null = null;
  userStats: UserStats | null = null;
  jobStats: JobStats | null = null;

  loading = true;
  chartsReady = false;

  private userChart: Chart | null = null;
  private jobChart: Chart | null = null;
  private revenueChart: Chart | null = null;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAllStats();
  }

  ngAfterViewInit(): void {
    this.chartsReady = true;
    this.tryInitCharts();
  }

  private tryInitCharts(): void {
    if (!this.loading && this.chartsReady) {
      // Force change detection then init charts after DOM update
      this.cdr.detectChanges();
      setTimeout(() => this.initCharts(), 50);
    }
  }

  private loadAllStats(): void {
    let completed = 0;
    const total = 4;

    const checkComplete = () => {
      completed++;
      if (completed === total) {
        this.loading = false;
        this.tryInitCharts();
      }
    };

    this.api.getOverviewStats().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.overviewStats = res.data;
        }
        checkComplete();
      },
      error: () => checkComplete()
    });

    this.api.getRevenueStats().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.revenueStats = res.data;
        }
        checkComplete();
      },
      error: () => checkComplete()
    });

    this.api.getUserStats().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.userStats = res.data;
        }
        checkComplete();
      },
      error: () => checkComplete()
    });

    this.api.getJobStats().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.jobStats = res.data;
        }
        checkComplete();
      },
      error: () => checkComplete()
    });
  }

  private initCharts(): void {
    this.initUserChart();
    this.initJobChart();
    this.initRevenueChart();
  }

  private initUserChart(): void {
    if (!this.userChartRef || !this.userStats) return;

    const ctx = this.userChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.userChart) {
      this.userChart.destroy();
    }

    this.userChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Employers', 'Freelancers', 'Blocked'],
        datasets: [{
          data: [
            this.userStats.total_employers,
            this.userStats.total_freelancers,
            this.userStats.blocked_users
          ],
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              padding: 20,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }

  private initJobChart(): void {
    if (!this.jobChartRef || !this.jobStats) return;

    const ctx = this.jobChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.jobChart) {
      this.jobChart.destroy();
    }

    this.jobChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Open', 'In Progress', 'Completed', 'Cancelled', 'Hidden'],
        datasets: [{
          label: 'Jobs',
          data: [
            this.jobStats.open_jobs,
            this.jobStats.assigned_jobs,
            this.jobStats.completed_jobs,
            this.jobStats.cancelled_jobs,
            this.jobStats.hidden_jobs
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(251, 146, 60, 0.7)',
            'rgba(34, 197, 94, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(148, 163, 184, 0.7)'
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(251, 146, 60, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(148, 163, 184, 1)'
          ],
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            }
          },
          y: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            }
          }
        }
      }
    });
  }

  private initRevenueChart(): void {
    if (!this.revenueChartRef || !this.revenueStats) return;

    const ctx = this.revenueChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.revenueChart) {
      this.revenueChart.destroy();
    }

    const categories = this.revenueStats.top_categories || [];

    this.revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories.map(c => c.category_name || `Category ${c.category_id}`),
        datasets: [{
          label: 'Revenue by Category',
          data: categories.map(c => c.total),
          backgroundColor: 'rgba(168, 85, 247, 0.7)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              callback: (value) => '$' + value
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            }
          },
          y: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            }
          }
        }
      }
    });
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
