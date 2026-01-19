import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  /**
   * Format date to locale string
   */
  format(date: string | Date | undefined | null, style: 'full' | 'short' | 'date' | 'time' = 'short'): string {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date + (date.includes('Z') ? '' : 'Z')) : date;
    
    switch (style) {
      case 'full':
        return d.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'date':
        return d.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      case 'time':
        return d.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      case 'short':
      default:
        return d.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
    }
  }


  relative(date: string | Date | undefined | null): string {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date + (date.includes('Z') ? '' : 'Z')) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return this.format(d, 'date');
  }
}
