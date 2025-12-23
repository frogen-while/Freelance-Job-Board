import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-job-detail',
  template: `
    <div *ngIf="job">
      <h1>{{ job.title }}</h1>
      <p>{{ job.description }}</p>
      <p>Budget: {{ job.budget }}</p>

      <h3>Apply</h3>
      <form (submit)="apply($event)">
        <input placeholder="Freelancer ID" [(ngModel)]="freelancerId" name="freelancerId" />
        <input placeholder="Bid amount" [(ngModel)]="bidAmount" name="bidAmount" />
        <textarea placeholder="Proposal" [(ngModel)]="proposalText" name="proposalText"></textarea>
        <button type="submit">Apply</button>
      </form>
    </div>
  `
})
export class JobDetailComponent implements OnInit {
  job: any | null = null;
  freelancerId = '';
  bidAmount = '';
  proposalText = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getJobById(id).subscribe((res: any) => this.job = res.data);
  }

  apply(e: Event) {
    e.preventDefault();
    const payload = {
      job_id: this.job.job_id,
      freelancer_id: Number(this.freelancerId),
      bid_amount: Number(this.bidAmount),
      proposal_text: this.proposalText,
      status: 'Pending'
    };
    this.api.applyToJob(payload).subscribe(() => alert('Application sent'));
  }
}