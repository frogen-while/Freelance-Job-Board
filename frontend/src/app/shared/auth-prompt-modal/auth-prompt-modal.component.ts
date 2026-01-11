import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-auth-prompt-modal',
  template: `
    <div class="modal-overlay" *ngIf="show" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="close()">×</button>
        
        <div class="modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </div>
        
        <h2 class="modal-title">{{ title }}</h2>
        <p class="modal-message">{{ message }}</p>
        
        <div class="modal-actions">
          <a class="btn-primary" routerLink="/login" [queryParams]="{ returnUrl: returnUrl }">
            Log In
          </a>
          <a class="btn-secondary" routerLink="/register">
            Sign Up Free
          </a>
        </div>
        
        <p class="modal-footer">
          Join thousands of professionals on our platform
        </p>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      animation: fadeIn 0.2s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .modal-content {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      text-align: center;
      position: relative;
      animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.75rem;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      line-height: 1;
      transition: color 0.2s;
      
      &:hover {
        color: #fff;
      }
    }
    
    .modal-icon {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      
      svg {
        width: 36px;
        height: 36px;
        color: #818cf8;
      }
    }
    
    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.75rem;
    }
    
    .modal-message {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.5;
      margin-bottom: 2rem;
    }
    
    .modal-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .btn-primary, .btn-secondary {
      display: block;
      padding: 0.875rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      text-decoration: none;
      text-align: center;
      transition: all 0.25s ease;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #fff;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
      }
    }
    
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
    
    .modal-footer {
      margin-top: 1.5rem;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.4);
    }
  `]
})
export class AuthPromptModalComponent {
  @Input() show = false;
  @Input() title = 'Sign in to continue';
  @Input() message = 'Create a free account or log in to access this feature.';
  @Input() returnUrl = '/';
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
