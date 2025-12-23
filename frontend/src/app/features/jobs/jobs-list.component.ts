import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-jobs-list',
  template: `
    <div>
      <h1>Jobs</h1>
      <ul>
        <li *ngFor="let j of jobs"><a [routerLink]="['/jobs', j.job_id]">{{j.title}}</a> — {{j.budget}}</li>
      </ul>
    </div>
  `
})
export class JobsListComponent implements OnInit {
  jobs: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.getJobs().subscribe((res: any) => this.jobs = res.data || []); }
}