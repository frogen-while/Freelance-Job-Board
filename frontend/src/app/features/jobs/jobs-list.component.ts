import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { Job } from '../../core/models';

@Component({
  selector: 'app-jobs-list',
  templateUrl: './jobs-list.component.html',
  styleUrls: ['./jobs-list.component.scss']
})
export class JobsListComponent implements OnInit {
  jobs: Job[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getJobs().subscribe(res => this.jobs = res.data || []);
  }
}