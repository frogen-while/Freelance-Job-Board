import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Job } from '../../core/models';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  freelancerId = '';
  bidAmount = '';
  proposalText = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getJobById(id).subscribe(res => this.job = res.data ?? null);
  }

  apply(e: Event) {
    e.preventDefault();
    if (!this.job) return;

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