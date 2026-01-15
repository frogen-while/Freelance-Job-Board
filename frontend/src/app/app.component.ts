import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  openSupport() {
    // Open support/help modal or navigate to support page
    alert('Support feature coming soon!');
    // You can replace this with actual support functionality like:
    // this.router.navigate(['/support']);
    // or open a modal dialog
  }
}