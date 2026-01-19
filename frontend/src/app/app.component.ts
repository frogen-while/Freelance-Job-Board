import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent {
  constructor(private router: Router) {}

  get isMessagesPage(): boolean {
    return this.router.url.startsWith('/messages');
  }

  openSupport() {
    this.router.navigate(['/support']);
  }
}