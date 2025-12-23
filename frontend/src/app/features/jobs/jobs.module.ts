import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobsListComponent } from './jobs-list.component';
import { JobDetailComponent } from './job-detail.component';

@NgModule({
  declarations: [JobsListComponent, JobDetailComponent],
  imports: [CommonModule, RouterModule.forChild([
    { path: '', component: JobsListComponent },
    { path: ':id', component: JobDetailComponent }
  ])]
})
export class JobsModule {}