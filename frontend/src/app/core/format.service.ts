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
      'assigned': '#2196f3',
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
}
