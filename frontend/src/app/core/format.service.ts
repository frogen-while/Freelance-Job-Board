import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormatService {

  getInitials(input: string | { first_name?: string; last_name?: string } | null | undefined): string {
    if (!input) return '?';

    if (typeof input === 'string') {
      const parts = input.split(' ').filter(p => p.length > 0);
      if (parts.length === 0) return '?';
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    const first = input.first_name?.charAt(0) || '';
    const last = input.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  formatBudget(budget: number | null | undefined): string {
    if (budget == null) return 'Negotiable';
    return '$' + budget.toLocaleString();
  }

  getExperienceLabel(level: string | null | undefined): string {
    if (!level) return 'Any Level';
    const labels: Record<string, string> = {
      'entry': 'Entry Level',
      'intermediate': 'Intermediate',
      'expert': 'Expert'
    };
    return labels[level.toLowerCase()] || level;
  }

  getStatusColor(status: string | null | undefined): string {
    const colors: Record<string, string> = {
      'open': '#ff9800',
      'in progress': '#2196f3',
      'resolved': '#4caf50',
      'closed': '#757575',
      'completed': '#4caf50',
      'cancelled': '#f44336'
    };
    return colors[(status || '').toLowerCase()] || '#999';
  }

  truncate(text: string | null | undefined, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  getStatusClass(status: string | null | undefined): string {
    if (!status) return 'status-default';
    const classes: Record<string, string> = {
      'pending': 'status-pending',
      'accepted': 'status-accepted',
      'rejected': 'status-rejected',
      'completed': 'status-completed',
      'open': 'status-open',
      'closed': 'status-closed',
      'active': 'status-active',
      'in progress': 'status-active'
    };
    return classes[status.toLowerCase()] || 'status-default';
  }

  getJobTypeLabel(type: string | null | undefined): string {
    if (!type) return 'Not specified';
    const labels: Record<string, string> = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'freelance': 'Freelance',
      'one-time': 'One-time Project',
      'ongoing': 'Ongoing'
    };
    return labels[type.toLowerCase()] || type;
  }

  getDurationLabel(duration: string | null | undefined): string {
    if (!duration) return 'Flexible';
    const labels: Record<string, string> = {
      'less_than_week': 'Less than a week',
      'less_than_month': 'Less than a month',
      '1-3_months': '1-3 months',
      '3-6_months': '3-6 months',
      'more_than_6_months': 'More than 6 months',
      'ongoing': 'Ongoing'
    };
    return labels[duration.toLowerCase()] || duration;
  }

  trackById<T extends { id?: number }>(_index: number, item: T): number {
    return (item as any).id ?? _index;
  }

  trackByAssignmentId(_index: number, item: { assignment_id: number }): number {
    return item.assignment_id;
  }

  trackByDeliverableId(_index: number, item: { deliverable_id: number }): number {
    return item.deliverable_id;
  }

  trackByJobId(_index: number, item: { job_id: number }): number {
    return item.job_id;
  }
}
